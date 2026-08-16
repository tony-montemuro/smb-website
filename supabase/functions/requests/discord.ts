/* ===== IMPORTS ===== */
import { SITE_URL } from "./linear.ts";
import type {
  DiscordMessage,
  FiledIssue,
  Requester,
  RequestParams,
  RequestType,
} from "./types.ts";

/* ===== CONSTANTS ===== */

// how each kind of request is presented: the name it is labelled with, and the color of its embed, which discord takes as a
// decimal integer, so the kind of a notification is readable before it is read
const PRESENTATION: Record<RequestType, { label: string; color: number }> = {
  feature: { label: "Feature", color: 0x57f287 },
  bug: { label: "Bug", color: 0xed4245 },
};

/* ===== FUNCTIONS ===== */

// FUNCTION 1: buildDiscordMessage - function that generates the body of the `Execute Webhook` call which announces a request
// PRECONDITIONS (3 parameters):
// 1.) params: the parameters of the request, already validated
// 2.) requester: the profile the request is attributed to
// 3.) issue: the issue the request was filed as
// POSTCONDITIONS (1 possible outcome):
// the body of the call is returned, as a single embed which carries the request, its kind, its requester, and a link to the issue
export const buildDiscordMessage = (
  params: RequestParams,
  requester: Requester,
  issue: FiledIssue,
): DiscordMessage => {
  const { label, color } = PRESENTATION[params.type];

  return {
    // the embed carries text a user wrote, posted verbatim, so without this an `@everyone` inside a request would ping the server
    allowed_mentions: { parse: [] },
    embeds: [{
      // NOTE: no length handling is necessary here: a request is capped well under the limits discord places on an embed
      title: params.title,
      url: issue.url,
      description: params.description,
      color,
      fields: [
        { name: "Type", value: label, inline: true },
        {
          name: "Requested By",
          value: `[${requester.username}](${SITE_URL}/user/${requester.id})`,
          inline: true,
        },
      ],
    }],
  };
};
