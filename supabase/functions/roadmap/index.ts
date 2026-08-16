/* ===== IMPORTS ===== */
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import {
  buildRoadmapIssue,
  isRemoval,
  isWithinReplayWindow,
  parseWebhookPayload,
  verifySignature,
} from "./linear.ts";
import { removeRoadmapIssue, syncRoadmapIssue } from "./queries.ts";
import type { Context, Database, RoadmapConfig } from "./types.ts";

/* ===== TYPES ===== */

// a function that generates the response of a single route. it is given the request itself, rather than a parsed body, since the
// signature of a delivery covers the bytes which arrived
type RouteHandler = (req: Request, ctx: Context) => Promise<Response>;

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

// FUNCTION 2: readRoadmapConfig - function that reads the configuration of the ingest from the environment
// PRECONDITIONS: NONE
// POSTCONDITIONS (2 possible outcomes):
// if each variable is set, the configuration is returned
// otherwise, null is returned
const readRoadmapConfig = (): RoadmapConfig | null => {
  const webhookSecret = Deno.env.get("LINEAR_WEBHOOK_SECRET");
  const publicLabelId = Deno.env.get("LINEAR_PUBLIC_LABEL_ID");

  if (!webhookSecret || !publicLabelId) {
    return null;
  }

  return { webhookSecret, publicLabelId };
};

// FUNCTION 3: acknowledge - function that generates the response of a delivery which did not fail
// PRECONDITIONS (1 parameter):
// 1.) ingested: whether the delivery changed the roadmap
// POSTCONDITIONS (1 possible outcome):
// a 200 response is returned, which is what stops linear retrying the delivery
// NOTE: deliberately doing nothing is as much of a success as writing is, so both cases are a 200, and only the body differs
const acknowledge = (ingested: boolean): Response => {
  return Response.json({ ingested });
};

// FUNCTION 4: handleWebhook - function that generates the response of the webhook route
// PRECONDITIONS (2 parameters):
// 1.) req: the delivery, whose raw body is what the signature covers
// 2.) ctx: the context of the request, which carries the clients each query runs through
// POSTCONDITIONS (5 possible outcomes):
// if the ingest is not configured, a 500 response is returned
// if the delivery is unsigned, or signed with another secret, a 401 response is returned
// if the delivery is older than the replay window, a 401 response is returned
// if the body is not json, or carries no issue this function can read, a 400 response is returned
// otherwise, the issue is written onto the roadmap or taken off it, and a 200 response is returned
const handleWebhook: RouteHandler = async (req, ctx) => {
  // unlike the discord webhook of the requests function, neither value is optional: an ingest with no secret would have to accept
  // unverified writes, and one with no label id could not tell a public issue from a private one
  const config = readRoadmapConfig();
  if (!config) {
    console.error("the roadmap configuration is incomplete");
    return errorResponse(500, "INTERNAL_ERROR", INTERNAL_MESSAGE);
  }

  // NOTE: the body is read as text rather than through `req.json()`, which the other functions use: the signature covers the
  // bytes which arrived, and re-stringifying a parsed object will not reproduce them
  const raw = await req.text();
  const signed = await verifySignature(
    raw,
    req.headers.get("Linear-Signature"),
    config.webhookSecret,
  );
  if (!signed) {
    return errorResponse(
      401,
      "INVALID_SIGNATURE",
      "Request must carry a `Linear-Signature` header which matches its body.",
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return errorResponse(
      400,
      "INVALID_BODY",
      "Request body must be valid json.",
    );
  }

  const payload = parseWebhookPayload(body);
  if (!payload) {
    return errorResponse(
      400,
      "INVALID_PAYLOAD",
      "Request body must be a linear webhook delivery.",
    );
  }

  // a signed body stays valid forever, so without this a captured "this issue is public" delivery could be replayed to resurrect
  // the row of an issue which has since been made private. the `updated_at` guard of the sync procedure does not cover that case,
  // since it only fires when the row still exists
  if (!isWithinReplayWindow(payload.webhookTimestamp, Date.now())) {
    return errorResponse(
      401,
      "EXPIRED_DELIVERY",
      "Request is older than the replay window.",
    );
  }

  // the webhook is subscribed to issues alone, so anything else is a subscription we did not ask for rather than a failure. this
  // is checked before the resource is held to the shape of an issue, since a delivery of another type owes us nothing
  if (payload.type !== ISSUE_RESOURCE_TYPE) {
    return acknowledge(false);
  }

  const { id, updatedAt } = payload.data;
  if (!id) {
    return errorResponse(400, "INCOMPLETE_ISSUE", INCOMPLETE_ISSUE_MESSAGE);
  }

  // a removal is decided from the payload rather than from the action, and it runs whether or not a row exists: a delete which
  // matches nothing is the answer for an issue that was never public in the first place
  if (isRemoval(payload, config.publicLabelId)) {
    await removeRoadmapIssue(ctx.supabaseAdmin, id, updatedAt);
    return acknowledge(true);
  }

  const issue = buildRoadmapIssue(payload.data);
  if (!issue) {
    return errorResponse(400, "INCOMPLETE_ISSUE", INCOMPLETE_ISSUE_MESSAGE);
  }

  await syncRoadmapIssue(ctx.supabaseAdmin, issue);
  return acknowledge(true);
};

/* ===== CONSTANTS ===== */

// the description of a failure whose detail belongs in the logs rather than in the answer
const INTERNAL_MESSAGE = "Unable to ingest the delivery.";

// the description of a delivery which carries an issue the roadmap cannot hold
const INCOMPLETE_ISSUE_MESSAGE =
  "Request body must carry an issue with an id, an identifier, a title, a state, and its timestamps.";

// the resource type this function syncs. the webhook is scoped to it, so every other type is answered without being read
const ISSUE_RESOURCE_TYPE = "Issue";

// the routes served by the function. NOTE: the platform strips the `/functions/v1` prefix before a request arrives
const ROUTES: { pattern: URLPattern; handle: RouteHandler }[] = [
  {
    pattern: new URLPattern({ pathname: "/roadmap/webhook" }),
    handle: handleWebhook,
  },
];

/* ===== EDGE FUNCTION ===== */

// The roadmap function mirrors the issues of the tracker which are explicitly marked public into a table the site reads. Its
// caller is linear rather than a person, and it authenticates with a signature over the body rather than with any supabase
// credential, so `verify_jwt` is off for this function and the auth mode is `none`. It writes through the admin client, since
// there is no user, and the writes have to bypass row level security.
export default {
  fetch: withSupabase<Database>({ auth: "none" }, async (req, ctx) => {
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
        "Each roadmap route expects a POST request.",
        { Allow: "POST" },
      );
    }

    // handling. NOTE: a failed write is answered with a 500 on purpose, since that is what puts the delivery back on the retry
    // schedule of linear. the detail is logged, rather than returned, since it describes our own schema
    try {
      return await route.handle(req, ctx);
    } catch (error) {
      console.error(`${pathname} failed:`, error);
      return errorResponse(500, "INTERNAL_ERROR", INTERNAL_MESSAGE);
    }
  }),
};
