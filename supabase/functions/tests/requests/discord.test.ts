/* ===== IMPORTS ===== */
import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { buildDiscordMessage } from "../../requests/discord.ts";
import type { FiledIssue, Requester } from "../../requests/types.ts";

/* ===== CONSTANTS ===== */

const REQUESTER: Requester = { id: 5, username: "TonySMB" };

const ISSUE: FiledIssue = {
  identifier: "SMB-42",
  url: "https://linear.app/smbelite/issue/SMB-42/the-timer-is-wrong",
};

const BUG = {
  type: "bug",
  title: "The timer is wrong",
  description: "The timer rounds up on every level of world 3.",
} as const;

const FEATURE = {
  type: "feature",
  title: "Dark mode",
  description: "Please.",
} as const;

/* ===== TESTS ===== */

describe("buildDiscordMessage", () => {
  it("carries the request, and links the embed at the issue", () => {
    const [embed] = buildDiscordMessage(BUG, REQUESTER, ISSUE).embeds;

    assertEquals(embed.title, BUG.title);
    assertEquals(embed.description, BUG.description);
    assertEquals(embed.url, ISSUE.url);
  });

  it("names the kind of the request, and colors the embed by it", () => {
    const bug = buildDiscordMessage(BUG, REQUESTER, ISSUE).embeds[0];
    const feature = buildDiscordMessage(FEATURE, REQUESTER, ISSUE).embeds[0];

    assertEquals(bug.fields[0], { name: "Type", value: "Bug", inline: true });
    assertEquals(feature.fields[0], {
      name: "Type",
      value: "Feature",
      inline: true,
    });
    assertEquals(bug.color === feature.color, false);
  });

  it("links the requester to their profile", () => {
    const [embed] = buildDiscordMessage(BUG, REQUESTER, ISSUE).embeds;
    const requester = embed.fields[1];

    assertEquals(requester.inline, true);
    assertStringIncludes(requester.value, REQUESTER.username);
    assertStringIncludes(
      requester.value,
      `https://smbelite.net/user/${REQUESTER.id}`,
    );
  });

  it("disarms every mention of a request written to abuse one", () => {
    const message = buildDiscordMessage(
      { ...BUG, title: "@everyone", description: "@here, and <@&1234>" },
      { ...REQUESTER, username: "@everyone" },
      ISSUE,
    );

    assertEquals(message.allowed_mentions, { parse: [] });
  });
});
