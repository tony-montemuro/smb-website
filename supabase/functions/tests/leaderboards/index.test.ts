/* ===== IMPORTS ===== */
import { assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import leaderboards from "../../leaderboards/index.ts";

/* ===== CONSTANTS ===== */

const PUBLISHABLE_KEY = "sb_publishable_test_key";

// `withSupabase` builds the admin client of every context eagerly, so a secret key has to be set, even though no route uses it.
// the platform injects both key sets at runtime
const SECRET_KEY = "sb_secret_test_key";

// each request is answered without a database, so the url of the client points at a port which refuses connections. a route which
// reaches a query therefore fails, which is exactly what the 500 case needs
const UNREACHABLE_URL = "http://127.0.0.1:1";

const PARAMS = {
  abb: "smb1",
  category: "main",
  score: true,
  liveOnly: false,
  version: null,
};

/* ===== FUNCTIONS ===== */

// FUNCTION 1: request - function that generates a request for a route of the function
// PRECONDITIONS (3 parameters):
// 1.) path: the path of the route, as the platform presents it to the function
// 2.) init: the method, body, and headers of the request
// 3.) apiKey: the value of the `apikey` header, or null to omit the header
// POSTCONDITIONS (1 possible outcome):
// a request is returned
const request = (
  path: string,
  init: RequestInit = {},
  apiKey: string | null = PUBLISHABLE_KEY,
): Request => {
  const headers = new Headers(init.headers);
  if (apiKey) {
    headers.set("apikey", apiKey);
  }

  return new Request(`http://localhost${path}`, {
    method: "POST",
    ...init,
    headers,
  });
};

/* ===== TESTS ===== */

describe("leaderboards", () => {
  beforeAll(() => {
    Deno.env.set("SUPABASE_URL", UNREACHABLE_URL);
    Deno.env.set("SUPABASE_PUBLISHABLE_KEY", PUBLISHABLE_KEY);
    Deno.env.set("SUPABASE_SECRET_KEY", SECRET_KEY);
  });

  afterAll(() => {
    Deno.env.delete("SUPABASE_URL");
    Deno.env.delete("SUPABASE_PUBLISHABLE_KEY");
    Deno.env.delete("SUPABASE_SECRET_KEY");
  });

  it("rejects a request with no publishable key", async () => {
    const response = await leaderboards.fetch(
      request("/leaderboards/records", { body: JSON.stringify(PARAMS) }, null),
    );

    assertEquals(response.status, 401);
    assertEquals((await response.json()).code, "INVALID_CREDENTIALS");
  });

  it("rejects a request with an incorrect publishable key", async () => {
    const response = await leaderboards.fetch(
      request(
        "/leaderboards/records",
        { body: JSON.stringify(PARAMS) },
        "sb_publishable_wrong_key",
      ),
    );

    assertEquals(response.status, 401);
  });

  it("rejects an unknown route", async () => {
    const response = await leaderboards.fetch(request("/leaderboards/medals"));

    assertEquals(response.status, 404);
    assertEquals((await response.json()).code, "NOT_FOUND");
  });

  it("rejects a known route requested with the wrong method", async () => {
    const response = await leaderboards.fetch(
      request("/leaderboards/records", { method: "GET" }),
    );

    assertEquals(response.status, 405);
    assertEquals(response.headers.get("Allow"), "POST");
  });

  it("rejects a body which is not json", async () => {
    const response = await leaderboards.fetch(
      request("/leaderboards/records", { body: "not json" }),
    );

    assertEquals(response.status, 400);
    assertEquals((await response.json()).code, "INVALID_BODY");
  });

  it("rejects a body which is missing a parameter", async () => {
    const { version: _version, ...incomplete } = PARAMS;
    const response = await leaderboards.fetch(
      request("/leaderboards/records", { body: JSON.stringify(incomplete) }),
    );

    assertEquals(response.status, 400);
    assertEquals((await response.json()).code, "INVALID_PARAMETERS");
  });

  it("rejects a body whose parameter has the wrong type", async () => {
    const response = await leaderboards.fetch(
      request("/leaderboards/records", {
        body: JSON.stringify({ ...PARAMS, score: "true" }),
      }),
    );

    assertEquals(response.status, 400);
    assertEquals((await response.json()).code, "INVALID_PARAMETERS");
  });

  it("serves each leaderboard route", async () => {
    for (const route of ["records", "totals"]) {
      const response = await leaderboards.fetch(
        request(`/leaderboards/${route}`, { body: "not json" }),
      );

      assertEquals(response.status, 400);
    }
  });

  it("hides the detail of a failed query", async () => {
    const response = await leaderboards.fetch(
      request("/leaderboards/records", { body: JSON.stringify(PARAMS) }),
    );

    assertEquals(response.status, 500);
    assertEquals(await response.json(), {
      message: "Unable to generate the leaderboard.",
      code: "INTERNAL_ERROR",
    });
  });
});
