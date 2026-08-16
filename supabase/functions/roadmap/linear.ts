/* ===== IMPORTS ===== */
import type { IssueData, RoadmapIssue, WebhookPayload } from "./types.ts";

/* ===== FUNCTIONS ===== */

// FUNCTION 1: decodeHex - function that decodes a hex string into the bytes it spells
// PRECONDITIONS (1 parameter):
// 1.) hex: the string to decode
// POSTCONDITIONS (2 possible outcomes):
// if the string is an even length run of hex digits, the bytes are returned
// otherwise, null is returned
const decodeHex = (hex: string): Uint8Array<ArrayBuffer> | null => {
  if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
    return null;
  }

  // NOTE: the buffer is spelled out, since `crypto.subtle` takes a view over an `ArrayBuffer` specifically, and the default type
  // parameter of `Uint8Array` also admits a shared one
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  return bytes;
};

// FUNCTION 2: readString - function that reads a string field out of arbitrary json
// PRECONDITIONS (2 parameters):
// 1.) source: the object the field is read from, which is not known to be an object at all
// 2.) key: the name of the field
// POSTCONDITIONS (2 possible outcomes):
// if the field is a string, it is returned
// otherwise, null is returned
const readString = (source: unknown, key: string): string | null => {
  const value = (source ?? {}) as Record<string, unknown>;
  return typeof value[key] === "string" ? value[key] : null;
};

// FUNCTION 3: verifySignature - function that decides whether a delivery was signed with the secret of our webhook
// PRECONDITIONS (3 parameters):
// 1.) rawBody: the body of the request, exactly as it arrived. a re-stringified parse will not reproduce the signed bytes
// 2.) signature: the `Linear-Signature` header, a hex encoded HMAC-SHA256 over that body, or null when the header is absent
// 3.) secret: the signing secret linear generated for the webhook
// POSTCONDITIONS (2 possible outcomes):
// if the signature is present, well formed, and matches, true is returned
// otherwise, false is returned
// NOTE: `crypto.subtle.verify` compares in constant time by construction, so no separate timing safe comparison is needed
export const verifySignature = async (
  rawBody: string,
  signature: string | null,
  secret: string,
): Promise<boolean> => {
  if (!signature) {
    return false;
  }

  const expected = decodeHex(signature);
  if (!expected) {
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  return await crypto.subtle.verify(
    "HMAC",
    key,
    expected,
    encoder.encode(rawBody),
  );
};

// FUNCTION 4: parseWebhookPayload - function that normalizes a delivery out of the json it arrived as
// PRECONDITIONS (1 parameter):
// 1.) body: the parsed json body of the request
// POSTCONDITIONS (2 possible outcomes):
// if the body carries an action, a resource type, and a timestamp, the delivery is returned, with whatever the resource it
// carries has in common with an issue read off it
// otherwise, null is returned
// NOTE: nothing here requires the resource to be an issue. the resource type is what decides that, and it is read by the caller,
// so a delivery of some other type is answered without ever being held to the shape of an issue
export const parseWebhookPayload = (body: unknown): WebhookPayload | null => {
  const { action, type, webhookTimestamp, data } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (
    typeof action !== "string" || typeof type !== "string" ||
    typeof webhookTimestamp !== "number" ||
    !Number.isFinite(webhookTimestamp)
  ) {
    return null;
  }

  const resource = (data ?? {}) as Record<string, unknown>;

  // the gate is read off the labels of the payload, so a payload which carries none at all is an issue with no labels, which is
  // an issue that is not public
  const labelIds = Array.isArray(resource.labels)
    ? resource.labels
      .map((label) => readString(label, "id"))
      .filter((labelId): labelId is string => labelId !== null)
    : [];

  const issue: IssueData = {
    id: readString(resource, "id"),
    identifier: readString(resource, "identifier"),
    title: readString(resource, "title"),
    stateName: readString(resource.state, "name"),
    stateType: readString(resource.state, "type"),
    projectName: readString(resource.project, "name"),
    createdAt: readString(resource, "createdAt"),
    updatedAt: readString(resource, "updatedAt"),
    completedAt: readString(resource, "completedAt"),
    archivedAt: readString(resource, "archivedAt"),
    labelIds,
  };

  return { action, type, webhookTimestamp, data: issue };
};

// FUNCTION 5: isWithinReplayWindow - function that decides whether a delivery is recent enough to act on
// PRECONDITIONS (2 parameters):
// 1.) webhookTimestamp: when linear says it sent the delivery, in epoch milliseconds
// 2.) now: the current time, in epoch milliseconds
// POSTCONDITIONS (2 possible outcomes):
// if the delivery is no older than the window, true is returned
// otherwise, false is returned
// NOTE: the window is twelve hours rather than the sixty seconds of the example handler of linear. the last retry of a failed
// delivery lands six hours out, and whether a retry carries the timestamp of the original delivery is undocumented, so a short
// window risks rejecting exactly the retries the ingest depends on
export const isWithinReplayWindow = (
  webhookTimestamp: number,
  now: number,
): boolean => {
  return now - webhookTimestamp <= REPLAY_WINDOW;
};

// FUNCTION 6: isRemoval - function that decides whether a delivery takes an issue off the roadmap
// PRECONDITIONS (2 parameters):
// 1.) payload: the delivery, already normalized
// 2.) publicLabelId: the id of the label which opts an issue into the roadmap
// POSTCONDITIONS (2 possible outcomes):
// if the issue lost the label, was archived, or was deleted outright, true is returned
// otherwise, false is returned
// NOTE: this is decided from the payload rather than from the action alone, so the undocumented choice linear makes between
// sending `remove` and sending an `update` which carries `archivedAt` never has to be answered
export const isRemoval = (
  payload: WebhookPayload,
  publicLabelId: string,
): boolean => {
  return payload.action === "remove" ||
    payload.data.archivedAt !== null ||
    !payload.data.labelIds.includes(publicLabelId);
};

// FUNCTION 7: buildRoadmapIssue - function that generates the arguments of `sync_roadmap_issue` from a delivery
// PRECONDITIONS (1 parameter):
// 1.) data: the issue the delivery carries, already normalized
// POSTCONDITIONS (2 possible outcomes):
// if every field the table requires is present, the arguments are returned
// otherwise, null is returned, since a row which is missing one of them cannot be written at all
export const buildRoadmapIssue = (data: IssueData): RoadmapIssue | null => {
  const { id, identifier, title, stateName, stateType, createdAt, updatedAt } =
    data;

  if (
    !id || !identifier || !title || !stateName || !stateType || !createdAt ||
    !updatedAt
  ) {
    return null;
  }

  return {
    p_linear_id: id,
    p_identifier: identifier,
    p_title: title,
    p_state_name: stateName,
    p_state_type: stateType,
    p_project_name: data.projectName,
    p_created_at: createdAt,
    p_updated_at: updatedAt,
    p_completed_at: data.completedAt,
  };
};

/* ===== CONSTANTS ===== */

// how old a delivery may be before it is refused, in milliseconds
const REPLAY_WINDOW = 12 * 60 * 60 * 1000;
