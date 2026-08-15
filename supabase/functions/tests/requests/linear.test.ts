/* ===== IMPORTS ===== */
import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { buildIssueInput } from "../../requests/linear.ts";
import type { LinearConfig, Requester } from "../../requests/types.ts";

/* ===== CONSTANTS ===== */

const CONFIG: LinearConfig = {
  apiKey: "lin_api_test_key",
  teamId: "team-id",
  projectId: "project-id",
  bugLabelId: "bug-label-id",
  featureLabelId: "feature-label-id",
};

const REQUESTER: Requester = { id: 5, username: "TonySMB" };

/* ===== TESTS ===== */

describe("buildIssueInput", () => {
  it("labels a bug with the bug label", () => {
    const input = buildIssueInput(
      { type: "bug", title: "The timer is wrong", description: "It rounds." },
      REQUESTER,
      CONFIG,
    );

    assertEquals(input.labelIds, [CONFIG.bugLabelId]);
  });

  it("labels a feature with the feature label", () => {
    const input = buildIssueInput(
      { type: "feature", title: "Dark mode", description: "Please." },
      REQUESTER,
      CONFIG,
    );

    assertEquals(input.labelIds, [CONFIG.featureLabelId]);
  });

  it("files the issue against the configured team and project", () => {
    const input = buildIssueInput(
      { type: "feature", title: "Dark mode", description: "Please." },
      REQUESTER,
      CONFIG,
    );

    assertEquals(input.teamId, CONFIG.teamId);
    assertEquals(input.projectId, CONFIG.projectId);
  });

  it("carries the title of the request verbatim", () => {
    const title = "the timer is wrong on smb1 (world 3)";
    const input = buildIssueInput(
      { type: "bug", title, description: "It rounds." },
      REQUESTER,
      CONFIG,
    );

    assertEquals(input.title, title);
  });

  it("carries the request, and attributes it to the requester", () => {
    const description = "The timer rounds up on every level of world 3.";
    const input = buildIssueInput(
      { type: "bug", title: "The timer is wrong", description },
      REQUESTER,
      CONFIG,
    );

    assertStringIncludes(input.description, description);
    assertStringIncludes(input.description, REQUESTER.username);
    assertStringIncludes(
      input.description,
      `https://smbelite.net/user/${REQUESTER.id}`,
    );
  });
});
