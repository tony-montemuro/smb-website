/* ===== IMPORTS ===== */
import { assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import roadmap from "../../roadmap/index.ts";

/* ===== CONSTANTS ===== */

// `withSupabase` builds the admin client of every context eagerly, so a secret key has to be set. this function then writes
// through that client, so it is the one every write below actually fails against. the platform injects both key sets at runtime
const PUBLISHABLE_KEY = "sb_publishable_test_key";
const SECRET_KEY = "sb_secret_test_key";

// each delivery is answered without a database, so the url of the client points at a port which refuses connections. a delivery
// which reaches a query therefore fails, which is exactly what the 500 case needs
const UNREACHABLE_URL = "http://127.0.0.1:1";

const ROADMAP_ENV = {
  LINEAR_WEBHOOK_SECRET: "lin_wh_test_secret",
  LINEAR_PUBLIC_LABEL_ID: "1a91c7a8-4a37-4d61-9c1e-2f5a6b7c8d90",
};

// the delivery each test starts from. only the fields the function reads are declared
const DELIVERY = {
  action: "update",
  type: "Issue",
  webhookTimestamp: Date.now(),
  data: {
    id: "c0ffee00-1111-4222-8333-444455556666",
    identifier: "SMB-23",
    title: "Linear Webhook Ingestion",
    createdAt: "2026-08-14T23:18:25.601Z",
    updatedAt: "2026-08-16T21:57:25.366Z",
    completedAt: null,
    archivedAt: null,
    state: { name: "In Progress", type: "started" },
    project: { name: "Streamline User Requests" },
    labels: [{ id: ROADMAP_ENV.LINEAR_PUBLIC_LABEL_ID }],
  },
};

/* ===== FUNCTIONS ===== */

// FUNCTION 1: sign - function that signs a body the way linear signs a delivery
// PRECONDITIONS (1 parameter):
// 1.) body: the body to sign
// POSTCONDITIONS (1 possible outcome):
// the hex encoded HMAC-SHA256 over the body is returned, which is what the `Linear-Signature` header carries
const sign = async (body: string): Promise<string> => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(ROADMAP_ENV.LINEAR_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

// FUNCTION 2: deliver - function that sends a signed delivery to the webhook route
// PRECONDITIONS (2 parameters):
// 1.) body: the delivery, which is signed as it is sent, unless a signature is given
// 2.) init: the path, method, and signature of the request, each of which defaults to the one a real delivery carries
// POSTCONDITIONS (1 possible outcome):
// the response of the function is returned
const deliver = async (
  body: unknown,
  init: {
    path?: string;
    method?: string;
    signature?: string | null;
  } = {},
): Promise<Response> => {
  const { path = "/roadmap/webhook", method = "POST" } = init;
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  const signature = init.signature === undefined
    ? await sign(raw)
    : init.signature;

  const headers = new Headers();
  if (signature !== null) {
    headers.set("Linear-Signature", signature);
  }

  return await roadmap.fetch(
    new Request(`http://localhost${path}`, {
      method,
      headers,
      body: method === "GET" ? null : raw,
    }),
  );
};

/* ===== TESTS ===== */

describe("roadmap", () => {
  beforeAll(() => {
    Deno.env.set("SUPABASE_URL", UNREACHABLE_URL);
    Deno.env.set("SUPABASE_PUBLISHABLE_KEY", PUBLISHABLE_KEY);
    Deno.env.set("SUPABASE_SECRET_KEY", SECRET_KEY);
    for (const [name, value] of Object.entries(ROADMAP_ENV)) {
      Deno.env.set(name, value);
    }
  });

  afterAll(() => {
    Deno.env.delete("SUPABASE_URL");
    Deno.env.delete("SUPABASE_PUBLISHABLE_KEY");
    Deno.env.delete("SUPABASE_SECRET_KEY");
    for (const name of Object.keys(ROADMAP_ENV)) {
      Deno.env.delete(name);
    }
  });

  it("rejects an unknown route", async () => {
    const response = await deliver(DELIVERY, { path: "/roadmap/issues" });

    assertEquals(response.status, 404);
    assertEquals((await response.json()).code, "NOT_FOUND");
  });

  it("rejects the route requested with the wrong method", async () => {
    const response = await deliver(DELIVERY, { method: "GET" });

    assertEquals(response.status, 405);
    assertEquals(response.headers.get("Allow"), "POST");
  });

  it("rejects a delivery which carries no signature", async () => {
    const response = await deliver(DELIVERY, { signature: null });

    assertEquals(response.status, 401);
    assertEquals((await response.json()).code, "INVALID_SIGNATURE");
  });

  it("rejects a delivery whose signature is malformed", async () => {
    const response = await deliver(DELIVERY, { signature: "not-a-signature" });

    assertEquals(response.status, 401);
    assertEquals((await response.json()).code, "INVALID_SIGNATURE");
  });

  it("rejects a delivery whose body was changed after it was signed", async () => {
    const signature = await sign(JSON.stringify(DELIVERY));
    const response = await deliver(
      { ...DELIVERY, data: { ...DELIVERY.data, title: "Something Else" } },
      { signature },
    );

    assertEquals(response.status, 401);
    assertEquals((await response.json()).code, "INVALID_SIGNATURE");
  });

  it("rejects a signed body which is not json", async () => {
    const response = await deliver("not json");

    assertEquals(response.status, 400);
    assertEquals((await response.json()).code, "INVALID_BODY");
  });

  it("rejects a signed body which is not a delivery", async () => {
    const response = await deliver({ hello: "world" });

    assertEquals(response.status, 400);
    assertEquals((await response.json()).code, "INVALID_PAYLOAD");
  });

  it("rejects a delivery older than the replay window", async () => {
    const response = await deliver({
      ...DELIVERY,
      webhookTimestamp: Date.now() - 13 * 60 * 60 * 1000,
    });

    assertEquals(response.status, 401);
    assertEquals((await response.json()).code, "EXPIRED_DELIVERY");
  });

  // NOTE: the database is unreachable here, so a 200 also proves that nothing was written
  it("ignores a delivery of a resource type it does not sync", async () => {
    const response = await deliver({
      ...DELIVERY,
      type: "Comment",
      data: { id: "9e1e3f52-0e6b-4a2c-9f47-8b5d1c0a2e34" },
    });

    assertEquals(response.status, 200);
    assertEquals(await response.json(), { ingested: false });
  });

  it("rejects an issue which is missing a field the roadmap requires", async () => {
    const { title: _title, ...incomplete } = DELIVERY.data;
    const response = await deliver({ ...DELIVERY, data: incomplete });

    assertEquals(response.status, 400);
    assertEquals((await response.json()).code, "INCOMPLETE_ISSUE");
  });

  // NOTE: a 500 is the answer on purpose, since it is what puts the delivery back on the retry schedule of linear
  it("reports a failed write, rather than swallowing it", async () => {
    const response = await deliver(DELIVERY);

    assertEquals(response.status, 500);
    assertEquals(await response.json(), {
      message: "Unable to ingest the delivery.",
      code: "INTERNAL_ERROR",
    });
  });

  it("reports a failed removal, rather than swallowing it", async () => {
    const response = await deliver({ ...DELIVERY, action: "remove" });

    assertEquals(response.status, 500);
    assertEquals((await response.json()).code, "INTERNAL_ERROR");
  });

  // NOTE: the configuration is read before the signature is verified, so an incomplete one answers even a valid delivery with a
  // 500. an ingest with no secret would have to accept unverified writes, so refusing is the only safe answer
  it("refuses a delivery when either secret is unset", async () => {
    for (const name of Object.keys(ROADMAP_ENV)) {
      Deno.env.delete(name);
      const response = await deliver(DELIVERY);
      Deno.env.set(name, ROADMAP_ENV[name as keyof typeof ROADMAP_ENV]);

      assertEquals(response.status, 500);
      assertEquals((await response.json()).code, "INTERNAL_ERROR");
    }
  });
});
