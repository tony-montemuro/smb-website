/* ===== IMPORTS ===== */
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  buildRoadmapIssue,
  isRemoval,
  isWithinReplayWindow,
  parseWebhookPayload,
  verifySignature,
} from "../../roadmap/linear.ts";
import type { WebhookPayload } from "../../roadmap/types.ts";

/* ===== CONSTANTS ===== */

// the signing secret linear generates for a webhook, and the id of the label which opts an issue into the roadmap
const SECRET = "lin_wh_test_secret";
const PUBLIC_LABEL_ID = "1a91c7a8-4a37-4d61-9c1e-2f5a6b7c8d90";

// the delivery each test starts from, as linear sends it. only the fields the function reads are declared, and the shape was
// checked against a real delivery
const DELIVERY = {
  action: "update",
  type: "Issue",
  webhookTimestamp: 1755385200000,
  data: {
    id: "c0ffee00-1111-4222-8333-444455556666",
    identifier: "SMB-23",
    title: "Linear Webhook Ingestion",
    createdAt: "2026-08-14T23:18:25.601Z",
    updatedAt: "2026-08-16T21:57:25.366Z",
    state: { name: "In Progress", type: "started" },
    project: { name: "Streamline User Requests" },
    labelIds: [PUBLIC_LABEL_ID],
    labels: [{ id: PUBLIC_LABEL_ID, name: "Public" }],
  },
};

// how long a delivery stays acceptable, in milliseconds
const REPLAY_WINDOW = 12 * 60 * 60 * 1000;

/* ===== FUNCTIONS ===== */

// FUNCTION 1: sign - function that signs a body the way linear signs a delivery
// PRECONDITIONS (2 parameters):
// 1.) body: the body to sign
// 2.) secret: the signing secret
// POSTCONDITIONS (1 possible outcome):
// the hex encoded HMAC-SHA256 over the body is returned, which is what the `Linear-Signature` header carries
const sign = async (body: string, secret: string): Promise<string> => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

// FUNCTION 2: payloadOf - function that normalizes a delivery, and fails the type check rather than the assertion when it cannot
// PRECONDITIONS (1 parameter):
// 1.) body: the delivery to normalize
// POSTCONDITIONS (1 possible outcome):
// the normalized delivery is returned. the tests which use it all pass a well formed delivery, so a null here is a broken test
const payloadOf = (body: unknown): WebhookPayload => {
  return parseWebhookPayload(body)!;
};

/* ===== TESTS ===== */

describe("verifySignature", () => {
  it("accepts a body signed with the secret of the webhook", async () => {
    const raw = JSON.stringify(DELIVERY);

    assertEquals(
      await verifySignature(raw, await sign(raw, SECRET), SECRET),
      true,
    );
  });

  it("rejects a body which was changed after it was signed", async () => {
    const raw = JSON.stringify(DELIVERY);
    const signature = await sign(raw, SECRET);
    const tampered = JSON.stringify({
      ...DELIVERY,
      data: { ...DELIVERY.data, title: "Something Else" },
    });

    assertEquals(await verifySignature(tampered, signature, SECRET), false);
  });

  // NOTE: this is the case a re-stringified parse would break. `JSON.stringify(JSON.parse(raw))` drops the whitespace linear
  // sent, and the signature covers the bytes which arrived, not the object they parse into
  it("rejects a body whose whitespace differs from the one which was signed", async () => {
    const raw = JSON.stringify(DELIVERY);
    const signature = await sign(raw, SECRET);

    assertEquals(
      await verifySignature(
        JSON.stringify(DELIVERY, null, 2),
        signature,
        SECRET,
      ),
      false,
    );
  });

  it("rejects a body signed with another secret", async () => {
    const raw = JSON.stringify(DELIVERY);

    assertEquals(
      await verifySignature(raw, await sign(raw, "another_secret"), SECRET),
      false,
    );
  });

  it("rejects a delivery which carries no signature at all", async () => {
    assertEquals(
      await verifySignature(JSON.stringify(DELIVERY), null, SECRET),
      false,
    );
  });

  // NOTE: each of these would throw inside the decoder rather than answer, which is a 500 where a 401 belongs
  it("rejects a signature which is not hex", async () => {
    const raw = JSON.stringify(DELIVERY);
    const signature = await sign(raw, SECRET);

    assertEquals(await verifySignature(raw, "", SECRET), false);
    assertEquals(await verifySignature(raw, "zzzz", SECRET), false);
    assertEquals(await verifySignature(raw, signature.slice(1), SECRET), false);
  });
});

describe("parseWebhookPayload", () => {
  it("normalizes a delivery", () => {
    const payload = payloadOf(DELIVERY);

    assertEquals(payload.action, "update");
    assertEquals(payload.type, "Issue");
    assertEquals(payload.webhookTimestamp, DELIVERY.webhookTimestamp);
    assertEquals(payload.data.id, DELIVERY.data.id);
    assertEquals(payload.data.identifier, "SMB-23");
    assertEquals(payload.data.stateName, "In Progress");
    assertEquals(payload.data.stateType, "started");
    assertEquals(payload.data.projectName, "Streamline User Requests");
    assertEquals(payload.data.labelIds, [PUBLIC_LABEL_ID]);
  });

  it("rejects a body which is not a delivery at all", () => {
    assertEquals(parseWebhookPayload(undefined), null);
    assertEquals(parseWebhookPayload({}), null);
    assertEquals(parseWebhookPayload("a string"), null);
  });

  it("rejects a delivery whose timestamp is not a number", () => {
    assertEquals(
      parseWebhookPayload({ ...DELIVERY, webhookTimestamp: "1755385200000" }),
      null,
    );
    assertEquals(
      parseWebhookPayload({ ...DELIVERY, webhookTimestamp: NaN }),
      null,
    );
  });

  // NOTE: a delivery of another resource type is answered without ever being held to the shape of an issue, so it has to parse
  it("normalizes a delivery which carries no issue", () => {
    const payload = payloadOf({
      action: "create",
      type: "Comment",
      webhookTimestamp: DELIVERY.webhookTimestamp,
    });

    assertEquals(payload.type, "Comment");
    assertEquals(payload.data.id, null);
    assertEquals(payload.data.labelIds, []);
  });

  it("reads no labels off an issue which carries none", () => {
    const { labels: _labels, ...unlabeled } = DELIVERY.data;
    const payload = payloadOf({ ...DELIVERY, data: unlabeled });

    assertEquals(payload.data.labelIds, []);
  });

  it("reads no project off an issue which belongs to none", () => {
    const { project: _project, ...unassigned } = DELIVERY.data;
    const payload = payloadOf({ ...DELIVERY, data: unassigned });

    assertEquals(payload.data.projectName, null);
  });
});

describe("isWithinReplayWindow", () => {
  it("accepts a delivery which just arrived", () => {
    const now = DELIVERY.webhookTimestamp + 250;

    assertEquals(isWithinReplayWindow(DELIVERY.webhookTimestamp, now), true);
  });

  // NOTE: the last retry of a failed delivery lands six hours out, which is what the window has to clear
  it("accepts the last retry of a failed delivery", () => {
    const now = DELIVERY.webhookTimestamp + 6 * 60 * 60 * 1000;

    assertEquals(isWithinReplayWindow(DELIVERY.webhookTimestamp, now), true);
  });

  it("accepts a delivery at the edge of the window", () => {
    const now = DELIVERY.webhookTimestamp + REPLAY_WINDOW;

    assertEquals(isWithinReplayWindow(DELIVERY.webhookTimestamp, now), true);
  });

  it("rejects a delivery past the window", () => {
    const now = DELIVERY.webhookTimestamp + REPLAY_WINDOW + 1;

    assertEquals(isWithinReplayWindow(DELIVERY.webhookTimestamp, now), false);
  });
});

describe("isRemoval", () => {
  it("syncs an issue which carries the public label", () => {
    assertEquals(isRemoval(payloadOf(DELIVERY), PUBLIC_LABEL_ID), false);
  });

  it("syncs an issue which carries the public label beside others", () => {
    const payload = payloadOf({
      ...DELIVERY,
      data: {
        ...DELIVERY.data,
        labels: [{ id: "another-label-id" }, { id: PUBLIC_LABEL_ID }],
      },
    });

    assertEquals(isRemoval(payload, PUBLIC_LABEL_ID), false);
  });

  it("removes an issue which lost the public label", () => {
    const payload = payloadOf({
      ...DELIVERY,
      data: { ...DELIVERY.data, labels: [{ id: "another-label-id" }] },
    });

    assertEquals(isRemoval(payload, PUBLIC_LABEL_ID), true);
  });

  it("removes an issue which was archived", () => {
    const payload = payloadOf({
      ...DELIVERY,
      data: { ...DELIVERY.data, archivedAt: "2026-08-16T22:00:00.000Z" },
    });

    assertEquals(isRemoval(payload, PUBLIC_LABEL_ID), true);
  });

  it("removes an issue which was deleted outright", () => {
    const payload = payloadOf({ ...DELIVERY, action: "remove" });

    assertEquals(isRemoval(payload, PUBLIC_LABEL_ID), true);
  });
});

describe("buildRoadmapIssue", () => {
  it("maps a delivery onto the arguments of the procedure", () => {
    assertEquals(buildRoadmapIssue(payloadOf(DELIVERY).data), {
      p_linear_id: DELIVERY.data.id,
      p_identifier: "SMB-23",
      p_title: "Linear Webhook Ingestion",
      p_state_name: "In Progress",
      p_state_type: "started",
      p_project_name: "Streamline User Requests",
      p_created_at: DELIVERY.data.createdAt,
      p_updated_at: DELIVERY.data.updatedAt,
      p_completed_at: null,
    });
  });

  it("maps an issue which belongs to no project", () => {
    const { project: _project, ...unassigned } = DELIVERY.data;
    const issue = buildRoadmapIssue(
      payloadOf({ ...DELIVERY, data: unassigned }).data,
    );

    assertEquals(issue?.p_project_name, null);
    assertEquals(issue?.p_identifier, "SMB-23");
  });

  it("maps an issue which has been completed", () => {
    const completedAt = "2026-08-16T22:30:00.000Z";
    const issue = buildRoadmapIssue(
      payloadOf({
        ...DELIVERY,
        data: {
          ...DELIVERY.data,
          completedAt,
          state: { name: "Done", type: "completed" },
        },
      }).data,
    );

    assertEquals(issue?.p_completed_at, completedAt);
    assertEquals(issue?.p_state_type, "completed");
  });

  // NOTE: linear accepts a title well past 255 characters, and postgres refuses one, so this is the case which would otherwise
  // throw, answer a 500, and lose the issue once the retries ran out
  it("clips a title past the width of its column", () => {
    const issue = buildRoadmapIssue(
      payloadOf({
        ...DELIVERY,
        data: { ...DELIVERY.data, title: "t".repeat(260) },
      }).data,
    );

    assertEquals(issue?.p_title.length, 255);
  });

  it("leaves a title within the width of its column alone", () => {
    const title = "t".repeat(255);
    const issue = buildRoadmapIssue(
      payloadOf({
        ...DELIVERY,
        data: { ...DELIVERY.data, title },
      }).data,
    );

    assertEquals(issue?.p_title, title);
  });

  it("clips every other value to the column which holds it", () => {
    const issue = buildRoadmapIssue(
      payloadOf({
        ...DELIVERY,
        data: {
          ...DELIVERY.data,
          identifier: "S".repeat(30),
          project: { name: "p".repeat(300) },
          state: { name: "s".repeat(300), type: "u".repeat(30) },
        },
      }).data,
    );

    assertEquals(issue?.p_identifier.length, 20);
    assertEquals(issue?.p_state_name.length, 255);
    assertEquals(issue?.p_state_type.length, 20);
    assertEquals(issue?.p_project_name?.length, 255);
  });

  // NOTE: postgres counts a character as a code point, and `slice` counts utf-16 code units, so cutting the other way would both
  // over-clip and split the pair, leaving a lone surrogate which cannot be encoded as utf-8
  it("clips by code point, without splitting a surrogate pair", () => {
    const title = "🐵".repeat(300);
    const issue = buildRoadmapIssue(
      payloadOf({
        ...DELIVERY,
        data: { ...DELIVERY.data, title },
      }).data,
    );

    assertEquals(Array.from(issue!.p_title).length, 255);
    assertEquals(issue?.p_title, "🐵".repeat(255));
  });

  it("leaves a nullable value which the payload did not carry as null", () => {
    const { project: _project, ...unassigned } = DELIVERY.data;
    const issue = buildRoadmapIssue(
      payloadOf({ ...DELIVERY, data: unassigned }).data,
    );

    assertEquals(issue?.p_project_name, null);
  });

  // NOTE: the table requires each of these, so a payload missing one cannot be written at all
  it("refuses an issue which is missing a field the row requires", () => {
    for (
      const field of [
        "id",
        "identifier",
        "title",
        "createdAt",
        "updatedAt",
        "state",
      ]
    ) {
      const { [field]: _missing, ...incomplete } = DELIVERY.data as Record<
        string,
        unknown
      >;

      assertEquals(
        buildRoadmapIssue(payloadOf({ ...DELIVERY, data: incomplete }).data),
        null,
      );
    }
  });

  // NOTE: the state is the one nested field, so dropping it takes out both halves of the guard at once. each half is covered on
  // its own here, or a guard which stopped checking one of them would leave every test above green
  it("refuses an issue whose state is missing a half", () => {
    for (const state of [{ name: "In Progress" }, { type: "started" }]) {
      assertEquals(
        buildRoadmapIssue(
          payloadOf({ ...DELIVERY, data: { ...DELIVERY.data, state } }).data,
        ),
        null,
      );
    }
  });
});
