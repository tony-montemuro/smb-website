/* ===== IMPORTS ===== */
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { buildDiscordMessage } from "./discord.ts";
import { buildIssueInput } from "./linear.ts";
import { consumeRequestToken, getRequesterProfile } from "./queries.ts";
import type {
  Context,
  Database,
  DiscordMessage,
  EdgeRuntimeGlobal,
  FiledIssue,
  IssueCreateInput,
  IssueCreateResponse,
  IssueCreateResult,
  LinearConfig,
  Requester,
  RequestParams,
} from "./types.ts";

/* ===== TYPES ===== */

// a function that generates the response of a single route, from the body of the request
type RouteHandler = (body: unknown, ctx: Context) => Promise<Response>;

/* ===== FUNCTIONS ===== */

// FUNCTION 1: errorResponse - function that generates the response of a failed request
// PRECONDITIONS (4 parameters):
// 1.) status: the http status code of the response
// 2.) code: a machine readable string which describes the failure
// 3.) message: a human readable description of the failure
// 4.) headers: an optional set of additional response headers
// POSTCONDITIONS (1 possible outcome):
// a json response is returned, whose shape matches the error responses that `withSupabase` generates
const errorResponse = (
  status: number,
  code: string,
  message: string,
  headers?: HeadersInit,
): Response => {
  return Response.json({ message, code }, { status, headers });
};

// FUNCTION 2: parseRequestParams - function that validates the request body of the submit route
// PRECONDITIONS (1 parameter):
// 1.) body: the json body of the request
// POSTCONDITIONS (2 possible outcomes):
// if the body defines each parameter with the expected type and length, the parameters are returned, each string trimmed
// otherwise, null is returned
export const parseRequestParams = (body: unknown): RequestParams | null => {
  const { type, title, description } = (body ?? {}) as Record<string, unknown>;

  if (
    (type !== "feature" && type !== "bug") ||
    typeof title !== "string" ||
    typeof description !== "string"
  ) {
    return null;
  }

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();

  if (
    trimmedTitle.length < 1 || trimmedTitle.length > TITLE_MAX_LENGTH ||
    trimmedDescription.length < 1 ||
    trimmedDescription.length > DESCRIPTION_MAX_LENGTH
  ) {
    return null;
  }

  return { type, title: trimmedTitle, description: trimmedDescription };
};

// FUNCTION 3: readLinearConfig - function that reads the workspace coordinates of the tracker from the environment
// PRECONDITIONS: NONE
// POSTCONDITIONS (2 possible outcomes):
// if each variable is set, the configuration is returned
// otherwise, null is returned
const readLinearConfig = (): LinearConfig | null => {
  const apiKey = Deno.env.get("LINEAR_API_KEY");
  const teamId = Deno.env.get("LINEAR_TEAM_ID");
  const projectId = Deno.env.get("LINEAR_REQUEST_PROJECT_ID");
  const bugLabelId = Deno.env.get("LINEAR_BUG_LABEL_ID");
  const featureLabelId = Deno.env.get("LINEAR_FEATURE_LABEL_ID");

  if (!apiKey || !teamId || !projectId || !bugLabelId || !featureLabelId) {
    return null;
  }

  return { apiKey, teamId, projectId, bugLabelId, featureLabelId };
};

// FUNCTION 4: createLinearIssue - function that files an issue in the tracker
// PRECONDITIONS (2 parameters):
// 1.) input: the input of the `issueCreate` mutation
// 2.) config: the workspace coordinates of the tracker
// POSTCONDITIONS (2 possible outcomes):
// if the issue was created, the outcome is returned as filed, carrying the issue whenever linear answered with one
// otherwise, the failure is logged, and the outcome is returned as unfiled
export const createLinearIssue = async (
  input: IssueCreateInput,
  config: LinearConfig,
): Promise<IssueCreateResult> => {
  try {
    const response = await fetch(LINEAR_API_URL, {
      method: "POST",
      headers: {
        // NOTE: a linear api key is sent as-is, without the `Bearer` prefix
        "Authorization": config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: ISSUE_CREATE_MUTATION,
        variables: { input },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });

    if (!response.ok) {
      console.error("linear rejected the mutation:", response.status);
      return UNFILED;
    }

    // NOTE: linear answers a failed mutation with a 200 and an `errors` array, so the status of the response settles nothing
    const result = await response.json() as IssueCreateResponse;
    if (result.errors?.length) {
      console.error("linear rejected the mutation:", result.errors);
      return UNFILED;
    }

    const issueCreate = result.data?.issueCreate;
    if (issueCreate?.success !== true) {
      return UNFILED;
    }

    // a success which carries no issue is still a success: the request of the user was filed, and only what points at it is missing
    return { filed: true, issue: issueCreate.issue ?? null };
  } catch (error) {
    console.error("linear is unreachable:", error);
    return UNFILED;
  }
};

// FUNCTION 5: postDiscordNotification - function that announces a filed request through an incoming webhook
// PRECONDITIONS (2 parameters):
// 1.) message: the body of the `Execute Webhook` call
// 2.) webhookUrl: the incoming webhook the message is posted to
// POSTCONDITIONS (2 possible outcomes):
// if the message was accepted, nothing happens
// otherwise, the failure is logged
// NOTE: this never rejects. it runs after the caller has been answered, so a rejection would have nobody left to catch it
export const postDiscordNotification = async (
  message: DiscordMessage,
  webhookUrl: string,
): Promise<void> => {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT),
    });

    if (!response.ok) {
      console.error("discord rejected the notification:", response.status);
    }
  } catch (error) {
    console.error("discord is unreachable:", error);
  }
};

// FUNCTION 6: notifyDiscord - function that announces a filed request in the background
// PRECONDITIONS (3 parameters):
// 1.) params: the parameters of the request, already validated
// 2.) requester: the profile the request is attributed to
// 3.) issue: the issue the request was filed as
// POSTCONDITIONS (2 possible outcomes):
// if no webhook is configured, nothing happens, since a destination is what makes notifications wanted at all
// otherwise, the notification is posted, without the caller waiting on it
const notifyDiscord = (
  params: RequestParams,
  requester: Requester,
  issue: FiledIssue,
): void => {
  const webhookUrl = Deno.env.get("DISCORD_REQUEST_WEBHOOK_URL");
  if (!webhookUrl) {
    return;
  }

  const notification = postDiscordNotification(
    buildDiscordMessage(params, requester, issue),
    webhookUrl,
  );

  // the platform keeps the isolate alive for a background task, which is what lets the response leave before the post finishes.
  // NOTE: the global is absent under `deno test`, where the promise is simply left to settle on its own
  const { EdgeRuntime } = globalThis as typeof globalThis & EdgeRuntimeGlobal;
  if (EdgeRuntime) {
    EdgeRuntime.waitUntil(notification);
  }
};

// FUNCTION 7: handleSubmit - function that generates the response of the submit route
// PRECONDITIONS (2 parameters):
// 1.) body: the json body of the request
// 2.) ctx: the context of the request, which carries the client each query runs through, and the claims of the caller
// POSTCONDITIONS (6 possible outcomes):
// if the body is invalid, a 400 response is returned
// if the tracker is not configured, a 500 response is returned
// if the caller has no profile, a 403 response is returned
// if the caller has no request tokens left, a 403 response is returned
// if the issue could not be filed, a 502 response is returned
// otherwise, the issue is filed, it is announced on discord in the background when linear named it, and the number of tokens the
// caller has left is returned
const handleSubmit: RouteHandler = async (body, ctx) => {
  const params = parseRequestParams(body);
  if (!params) {
    return errorResponse(400, "INVALID_PARAMETERS", PARAMETERS_MESSAGE);
  }

  // the configuration is read before the token is spent, since a misconfiguration of ours should never cost a user a request
  const config = readLinearConfig();
  if (!config) {
    console.error("the tracker configuration is incomplete");
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Unable to file the request.",
    );
  }

  const requester = await getRequesterProfile(ctx.supabase, ctx.userClaims!.id);
  if (!requester) {
    return errorResponse(
      403,
      "NO_PROFILE",
      "Create your profile before submitting a request.",
    );
  }

  // the token is spent before the issue is filed, and it is not refunded when filing fails: the spend is what limits abuse, so it
  // cannot depend on the tracker being up
  const requestToken = await consumeRequestToken(ctx.supabase);
  if (requestToken === null) {
    return errorResponse(
      403,
      "NO_REQUESTS_REMAINING",
      "You have run out of requests for the day. Try again tomorrow.",
    );
  }

  const { filed, issue } = await createLinearIssue(
    buildIssueInput(params, requester, config),
    config,
  );
  if (!filed) {
    return errorResponse(
      502,
      "LINEAR_UNAVAILABLE",
      "Unable to reach the issue tracker. This attempt still counted against today's requests.",
    );
  }

  // the request is filed and the token is spent by this point, so the notification can neither delay nor change the answer
  if (issue) {
    notifyDiscord(params, requester, issue);
  }

  return Response.json({ requestToken });
};

/* ===== CONSTANTS ===== */

// the length limits of a request.
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 1000;

// the description of an invalid request body
const PARAMETERS_MESSAGE =
  `Request body must define \`type\` as either "feature" or "bug", \`title\` with 1 to ${TITLE_MAX_LENGTH} characters, and \`description\` with 1 to ${DESCRIPTION_MAX_LENGTH} characters.`;

// the outcome of every attempt which did not file an issue
const UNFILED: IssueCreateResult = { filed: false, issue: null };

// the tracker, how long it gets to answer, and the mutation which files an issue in it
const LINEAR_API_URL = "https://api.linear.app/graphql";
const REQUEST_TIMEOUT = 10000;
const ISSUE_CREATE_MUTATION = `
  mutation CreateIssue($input: IssueCreateInput!) {
    issueCreate(input: $input) {
      success
      issue {
        url
      }
    }
  }
`;

// how long discord gets to accept a notification. it is shorter than the tracker gets, since nothing waits on the answer
const NOTIFICATION_TIMEOUT = 5000;

// the routes served by the function. NOTE: the platform strips the `/functions/v1` prefix before a request arrives
const ROUTES: { pattern: URLPattern; handle: RouteHandler }[] = [
  {
    pattern: new URLPattern({ pathname: "/requests/submit" }),
    handle: handleSubmit,
  },
];

/* ===== EDGE FUNCTION ===== */

// The requests function files the feature and bug requests of a user in the issue tracker. Unlike `leaderboards`, it writes on
// behalf of a specific person, so it requires a user token, and the platform check on this function stays enabled.
export default {
  fetch: withSupabase<Database>({ auth: "user" }, async (req, ctx) => {
    const pathname = new URL(req.url).pathname;
    const route = ROUTES.find(({ pattern }) => pattern.test({ pathname }));

    // routing
    if (!route) {
      return errorResponse(404, "NOT_FOUND", `No route matches ${pathname}.`);
    }
    if (req.method !== "POST") {
      return errorResponse(
        405,
        "METHOD_NOT_ALLOWED",
        "Each request route expects a POST request.",
        { Allow: "POST" },
      );
    }

    // body parsing
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse(
        400,
        "INVALID_BODY",
        "Request body must be valid json.",
      );
    }

    // handling. NOTE: the detail of a failed query is logged, rather than returned, since it describes our own schema
    try {
      return await route.handle(body, ctx);
    } catch (error) {
      console.error(`${pathname} failed:`, error);
      return errorResponse(
        500,
        "INTERNAL_ERROR",
        "Unable to file the request.",
      );
    }
  }),
};
