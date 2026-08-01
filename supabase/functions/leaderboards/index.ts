/* ===== IMPORTS ===== */
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import {
  getCategoryLevelsByMode,
  getCategoryTime,
  getPracticeCategories,
  getRankedSubmissions,
  getRecordSubmissions,
} from "./queries.ts";
import { buildRecordTable } from "./records.ts";
import { buildTotals } from "./totals.ts";
import { buildUserRankings } from "./user_rankings.ts";
import type {
  Client,
  Database,
  LeaderboardParams,
  UserRankingsParams,
} from "./types.ts";

/* ===== TYPES ===== */

// a function that generates the response of a single route, from the body of the request
type RouteHandler = (body: unknown, client: Client) => Promise<Response>;

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

// FUNCTION 2: parseLeaderboardParams - function that validates the request body shared by each leaderboard route
// PRECONDITIONS (1 parameter):
// 1.) body: the json body of the request
// POSTCONDITIONS (2 possible outcomes):
// if the body defines each parameter with the expected type, the parameters are returned
// otherwise, null is returned
const parseLeaderboardParams = (body: unknown): LeaderboardParams | null => {
  const { abb, category, score, liveOnly, version } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (
    typeof abb !== "string" ||
    typeof category !== "string" ||
    typeof score !== "boolean" ||
    typeof liveOnly !== "boolean" ||
    (version !== null && typeof version !== "number")
  ) {
    return null;
  }

  return { abb, category, score, liveOnly, version };
};

// FUNCTION 3: parseUserRankingsParams - function that validates the request body of the user rankings route
// PRECONDITIONS (1 parameter):
// 1.) body: the json body of the request
// POSTCONDITIONS (2 possible outcomes):
// if the body defines each parameter with the expected type, the parameters are returned
// otherwise, null is returned
const parseUserRankingsParams = (body: unknown): UserRankingsParams | null => {
  const params = parseLeaderboardParams(body);
  const { profileId } = (body ?? {}) as Record<string, unknown>;

  if (!params || typeof profileId !== "number") {
    return null;
  }

  return { ...params, profileId };
};

// FUNCTION 4: handleRecords - function that generates the response of the records route
// PRECONDITIONS (2 parameters):
// 1.) body: the json body of the request
// 2.) client: the supabase client which each query runs through
// POSTCONDITIONS (3 possible outcomes):
// if the body is invalid, a 400 response is returned
// if each query is successful, the record table of the game is returned
// otherwise, this function throws an error, which should be handled by the caller function
const handleRecords: RouteHandler = async (body, client) => {
  const params = parseLeaderboardParams(body);
  if (!params) {
    return errorResponse(400, "INVALID_PARAMETERS", PARAMETERS_MESSAGE);
  }

  const [submissions, modes] = await Promise.all([
    getRecordSubmissions(client, params),
    getCategoryLevelsByMode(client, params),
  ]);

  return Response.json(buildRecordTable(submissions, modes));
};

// FUNCTION 5: handleTotals - function that generates the response of the totals route
// PRECONDITIONS (2 parameters):
// 1.) body: the json body of the request
// 2.) client: the supabase client which each query runs through
// POSTCONDITIONS (4 possible outcomes):
// if the body is invalid, a 400 response is returned
// if the category is not a practice mode category, an empty totalizer is returned
// if each query is successful, the totalizer of the game is returned
// otherwise, this function throws an error, which should be handled by the caller function
const handleTotals: RouteHandler = async (body, client) => {
  const params = parseLeaderboardParams(body);
  if (!params) {
    return errorResponse(400, "INVALID_PARAMETERS", PARAMETERS_MESSAGE);
  }

  // a totalizer only exists for practice mode categories
  const practiceCategories = await getPracticeCategories(client);
  if (!practiceCategories.includes(params.category)) {
    return Response.json([]);
  }

  // the total time is only needed by a time totalizer
  const [submissions, totalTime] = await Promise.all([
    getRankedSubmissions(client, params),
    params.score ? 0 : getCategoryTime(client, params),
  ]);

  return Response.json(buildTotals(submissions, params.score, totalTime));
};

// FUNCTION 6: handleUserRankings - function that generates the response of the user rankings route
// PRECONDITIONS (2 parameters):
// 1.) body: the json body of the request
// 2.) client: the supabase client which each query runs through
// POSTCONDITIONS (3 possible outcomes):
// if the body is invalid, a 400 response is returned
// if each query is successful, the rankings of the profile are returned
// otherwise, this function throws an error, which should be handled by the caller function
const handleUserRankings: RouteHandler = async (body, client) => {
  const params = parseUserRankingsParams(body);
  if (!params) {
    return errorResponse(
      400,
      "INVALID_PARAMETERS",
      USER_RANKINGS_PARAMETERS_MESSAGE,
    );
  }

  const [submissions, modes] = await Promise.all([
    getRankedSubmissions(client, params),
    getCategoryLevelsByMode(client, params),
  ]);

  return Response.json(
    buildUserRankings(submissions, modes, params.profileId),
  );
};

/* ===== CONSTANTS ===== */

// the description of an invalid request body, shared by each route which takes the leaderboard parameters
const PARAMETERS_MESSAGE =
  "Request body must define `abb`, `category`, `score`, `liveOnly`, and `version` (optional).";

// the description of an invalid request body for the user rankings route, which takes the profile as well
const USER_RANKINGS_PARAMETERS_MESSAGE =
  "Request body must define `abb`, `category`, `score`, `liveOnly`, `profileId`, and `version` (optional).";

// the routes served by the function. NOTE: the platform strips the `/functions/v1` prefix before a request arrives
const ROUTES: { pattern: URLPattern; handle: RouteHandler }[] = [
  {
    pattern: new URLPattern({ pathname: "/leaderboards/records" }),
    handle: handleRecords,
  },
  {
    pattern: new URLPattern({ pathname: "/leaderboards/totals" }),
    handle: handleTotals,
  },
  {
    pattern: new URLPattern({ pathname: "/leaderboards/user_rankings" }),
    handle: handleUserRankings,
  },
];

/* ===== EDGE FUNCTION ===== */

// The leaderboards function serves the queries that generate the leaderboard pages. Callers authenticate with the publishable
// key alone: leaderboards are public data, and a logged out visitor sends no `Authorization` header at all, so a user JWT cannot
// be required here.
export default {
  fetch: withSupabase<Database>({ auth: "publishable" }, async (req, ctx) => {
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
        "Each leaderboard route expects a POST request.",
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
      return await route.handle(body, ctx.supabase);
    } catch (error) {
      console.error(`${pathname} failed:`, error);
      return errorResponse(
        500,
        "INTERNAL_ERROR",
        "Unable to generate the leaderboard.",
      );
    }
  }),
};
