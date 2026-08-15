/* ===== IMPORTS ===== */
import { assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import requests, { parseRequestParams } from "../../requests/index.ts";

/* ===== CONSTANTS ===== */

// `withSupabase` builds the admin client of every context eagerly, so a secret key has to be set, even though no route uses it.
// the platform injects both key sets at runtime
const PUBLISHABLE_KEY = "sb_publishable_test_key";
const SECRET_KEY = "sb_secret_test_key";

// each request is answered without a database, so the url of the client points at a port which refuses connections. a route which
// reaches a query therefore fails, which is exactly what the 500 case needs
const UNREACHABLE_URL = "http://127.0.0.1:1";

// the key which signs the token of each test, published through an inline JWKS. `auth: "user"` verifies a token against that set,
// so the routing, method, and body cases are only reachable with a token this key signed
const KEY_ID = "test-key";

const LINEAR_ENV = {
  LINEAR_API_KEY: "lin_api_test_key",
  LINEAR_TEAM_ID: "team-id",
  LINEAR_REQUEST_PROJECT_ID: "project-id",
  LINEAR_BUG_LABEL_ID: "bug-label-id",
  LINEAR_FEATURE_LABEL_ID: "feature-label-id",
};

const PARAMS = {
  type: "bug",
  title: "The timer is wrong",
  description: "The timer rounds up on every level of world 3.",
};

/* ===== VARIABLES ===== */

let token: string;

/* ===== FUNCTIONS ===== */

// FUNCTION 1: base64Url - function that encodes bytes as a base64url string, the encoding of each segment of a token
// PRECONDITIONS (1 parameter):
// 1.) bytes: the bytes to encode
// POSTCONDITIONS (1 possible outcome):
// the encoded string is returned, with no padding
const base64Url = (bytes: Uint8Array): string => {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

// FUNCTION 2: signToken - function that mints a token which the function will accept
// PRECONDITIONS (1 parameter):
// 1.) key: the private key of the pair whose public key is published through the JWKS
// POSTCONDITIONS (1 possible outcome):
// an ES256 token is returned, which expires an hour from now
const signToken = async (key: CryptoKey): Promise<string> => {
  const encoder = new TextEncoder();
  const segment = (value: unknown) =>
    base64Url(encoder.encode(JSON.stringify(value)));

  const payload = segment({
    sub: "0f9b3d4a-1c2e-4f56-8a7b-9c0d1e2f3a4b",
    role: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  const data = `${
    segment({ alg: "ES256", typ: "JWT", kid: KEY_ID })
  }.${payload}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    encoder.encode(data),
  );

  return `${data}.${base64Url(new Uint8Array(signature))}`;
};

// FUNCTION 3: request - function that generates a request for a route of the function
// PRECONDITIONS (3 parameters):
// 1.) path: the path of the route, as the platform presents it to the function
// 2.) init: the method, body, and headers of the request
// 3.) jwt: the token to authenticate with, or null to omit the header
// POSTCONDITIONS (1 possible outcome):
// a request is returned
const request = (
  path: string,
  init: RequestInit = {},
  jwt: string | null = token,
): Request => {
  const headers = new Headers(init.headers);
  if (jwt) {
    headers.set("Authorization", `Bearer ${jwt}`);
  }

  return new Request(`http://localhost${path}`, {
    method: "POST",
    ...init,
    headers,
  });
};

/* ===== TESTS ===== */

describe("requests", () => {
  beforeAll(async () => {
    const { privateKey, publicKey } = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"],
    );

    // only the parameters of the curve are published: the key material that `exportKey` adds beside them is not part of a JWKS
    const { kty, crv, x, y } = await crypto.subtle.exportKey("jwk", publicKey);
    const jwks = {
      keys: [{ kty, crv, x, y, kid: KEY_ID, alg: "ES256", use: "sig" }],
    };

    token = await signToken(privateKey);

    Deno.env.set("SUPABASE_URL", UNREACHABLE_URL);
    Deno.env.set("SUPABASE_PUBLISHABLE_KEY", PUBLISHABLE_KEY);
    Deno.env.set("SUPABASE_SECRET_KEY", SECRET_KEY);
    Deno.env.set("SUPABASE_JWKS", JSON.stringify(jwks));
    for (const [name, value] of Object.entries(LINEAR_ENV)) {
      Deno.env.set(name, value);
    }
  });

  afterAll(() => {
    Deno.env.delete("SUPABASE_URL");
    Deno.env.delete("SUPABASE_PUBLISHABLE_KEY");
    Deno.env.delete("SUPABASE_SECRET_KEY");
    Deno.env.delete("SUPABASE_JWKS");
    for (const name of Object.keys(LINEAR_ENV)) {
      Deno.env.delete(name);
    }
  });

  it("rejects a request with no token", async () => {
    const response = await requests.fetch(
      request("/requests/submit", { body: JSON.stringify(PARAMS) }, null),
    );

    assertEquals(response.status, 401);
  });

  it("rejects a request with a token it did not sign", async () => {
    const response = await requests.fetch(
      request(
        "/requests/submit",
        { body: JSON.stringify(PARAMS) },
        `${token.slice(0, -4)}wxyz`,
      ),
    );

    assertEquals(response.status, 401);
  });

  it("rejects an unknown route", async () => {
    const response = await requests.fetch(request("/requests/status"));

    assertEquals(response.status, 404);
    assertEquals((await response.json()).code, "NOT_FOUND");
  });

  it("rejects a known route requested with the wrong method", async () => {
    const response = await requests.fetch(
      request("/requests/submit", { method: "GET" }),
    );

    assertEquals(response.status, 405);
    assertEquals(response.headers.get("Allow"), "POST");
  });

  it("rejects a body which is not json", async () => {
    const response = await requests.fetch(
      request("/requests/submit", { body: "not json" }),
    );

    assertEquals(response.status, 400);
    assertEquals((await response.json()).code, "INVALID_BODY");
  });

  it("rejects a body which is missing a parameter", async () => {
    const { description: _description, ...incomplete } = PARAMS;
    const response = await requests.fetch(
      request("/requests/submit", { body: JSON.stringify(incomplete) }),
    );

    assertEquals(response.status, 400);
    assertEquals((await response.json()).code, "INVALID_PARAMETERS");
  });

  it("refuses to file a request when the tracker is not configured", async () => {
    Deno.env.delete("LINEAR_API_KEY");
    const response = await requests.fetch(
      request("/requests/submit", { body: JSON.stringify(PARAMS) }),
    );
    Deno.env.set("LINEAR_API_KEY", LINEAR_ENV.LINEAR_API_KEY);

    assertEquals(response.status, 500);
    assertEquals((await response.json()).code, "INTERNAL_ERROR");
  });

  it("hides the detail of a failed query", async () => {
    const response = await requests.fetch(
      request("/requests/submit", { body: JSON.stringify(PARAMS) }),
    );

    assertEquals(response.status, 500);
    assertEquals(await response.json(), {
      message: "Unable to file the request.",
      code: "INTERNAL_ERROR",
    });
  });
});

describe("parseRequestParams", () => {
  it("accepts each type of request", () => {
    for (const type of ["feature", "bug"]) {
      assertEquals(parseRequestParams({ ...PARAMS, type })?.type, type);
    }
  });

  it("rejects an unrecognized type", () => {
    assertEquals(parseRequestParams({ ...PARAMS, type: "question" }), null);
  });

  it("rejects a body which defines no parameter at all", () => {
    assertEquals(parseRequestParams(undefined), null);
    assertEquals(parseRequestParams({}), null);
  });

  it("rejects a parameter of the wrong type", () => {
    assertEquals(
      parseRequestParams({ ...PARAMS, type: { "foo": "bar" } }),
      null,
    );
    assertEquals(parseRequestParams({ ...PARAMS, title: 5 }), null);
    assertEquals(parseRequestParams({ ...PARAMS, description: null }), null);
  });

  it("trims each string of the request", () => {
    const params = parseRequestParams({
      ...PARAMS,
      title: `  ${PARAMS.title}  `,
      description: `\n${PARAMS.description}\n`,
    });

    assertEquals(params?.title, PARAMS.title);
    assertEquals(params?.description, PARAMS.description);
  });

  it("rejects a request which is empty once trimmed", () => {
    assertEquals(parseRequestParams({ ...PARAMS, title: "   " }), null);
    assertEquals(parseRequestParams({ ...PARAMS, description: " " }), null);
  });

  it("accepts a request at each length limit", () => {
    const params = parseRequestParams({
      ...PARAMS,
      title: "t".repeat(100),
      description: "d".repeat(1000),
    });

    assertEquals(params?.title.length, 100);
    assertEquals(params?.description.length, 1000);
  });

  it("accepts a request initially beyond limits, but within limits once trimmed", () => {
    const params = parseRequestParams({
      ...PARAMS,
      title: `  ${"t".repeat(100)}\n`,
      description: `\t${"d".repeat(1000)}\n`,
    });

    assertEquals(params?.title.length, 100);
    assertEquals(params?.description.length, 1000);
  });

  it("rejects a request past either length limit", () => {
    assertEquals(
      parseRequestParams({ ...PARAMS, title: "t".repeat(101) }),
      null,
    );
    assertEquals(
      parseRequestParams({ ...PARAMS, description: "d".repeat(1001) }),
      null,
    );
  });
});
