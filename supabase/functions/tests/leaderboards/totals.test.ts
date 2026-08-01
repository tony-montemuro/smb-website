/* ===== IMPORTS ===== */
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { buildTotals } from "../../leaderboards/totals.ts";
import type { RankedSubmission } from "../../leaderboards/types.ts";

/* ===== FUNCTIONS ===== */

// FUNCTION 1: submission - function that generates a ranked submission, with each unspecified field defaulted
// PRECONDITIONS (1 parameter):
// 1.) fields: the fields of the submission which the test cares about
// POSTCONDITIONS (1 possible outcome):
// a complete ranked submission is returned
const submission = (fields: Partial<RankedSubmission>): RankedSubmission => ({
  game_id: "smb1",
  level_id: "beginner_1",
  category: "main",
  id: 1,
  username: "user",
  country: "US",
  record: 1,
  submitted_at: "2024-01-01T12:00:00.000000+00:00",
  live: true,
  position: 1,
  ...fields,
});

/* ===== TESTS ===== */

describe("buildTotals", () => {
  it("returns nothing when there are no submissions", () => {
    assertEquals(buildTotals([], true, 0), []);
  });

  it("sums the records a profile holds across levels", () => {
    const totals = buildTotals(
      [
        submission({ id: 1, level_id: "beginner_1", record: 10 }),
        submission({ id: 1, level_id: "beginner_2", record: 20 }),
      ],
      true,
      0,
    );

    assertEquals(totals, [
      {
        profile: { id: 1, username: "user", country: "US" },
        total: 30,
        position: 1,
      },
    ]);
  });

  it("sorts a score totalizer from the highest total down", () => {
    const totals = buildTotals(
      [
        submission({ id: 1, record: 10 }),
        submission({ id: 2, record: 30 }),
        submission({ id: 3, record: 20 }),
      ],
      true,
      0,
    );

    assertEquals(totals.map((total) => total.total), [30, 20, 10]);
    assertEquals(totals.map((total) => total.profile.id), [2, 3, 1]);
  });

  it("counts a time total down from the total time of the category", () => {
    const totals = buildTotals(
      [
        submission({ id: 1, level_id: "beginner_1", record: 10 }),
        submission({ id: 1, level_id: "beginner_2", record: 20 }),
      ],
      false,
      100,
    );

    assertEquals(totals[0].total, 70);
  });

  it("subtracts a time record which is already negative", () => {
    const totals = buildTotals(
      [submission({ id: 1, record: -10 })],
      false,
      100,
    );

    assertEquals(totals[0].total, 90);
  });

  it("sorts a time totalizer from the lowest total up", () => {
    const totals = buildTotals(
      [
        submission({ id: 1, record: 10 }),
        submission({ id: 2, record: 30 }),
        submission({ id: 3, record: 20 }),
      ],
      false,
      100,
    );

    assertEquals(totals.map((total) => total.total), [70, 80, 90]);
    assertEquals(totals.map((total) => total.profile.id), [2, 3, 1]);
  });

  it("gives tied profiles the same position, and skips the positions they consume", () => {
    const totals = buildTotals(
      [
        submission({ id: 1, record: 10 }),
        submission({ id: 2, record: 10 }),
        submission({ id: 3, record: 5 }),
        submission({ id: 4, record: 1 }),
      ],
      true,
      0,
    );

    assertEquals(totals.map((total) => total.total), [10, 10, 5, 1]);
    assertEquals(totals.map((total) => total.position), [1, 1, 3, 4]);
  });

  it("orders tied profiles by profile id in a score totalizer", () => {
    const totals = buildTotals(
      [
        submission({ id: 9, record: 10 }),
        submission({ id: 2, record: 10 }),
      ],
      true,
      0,
    );

    assertEquals(totals.map((total) => total.profile.id), [2, 9]);
  });

  it("orders tied profiles by descending profile id in a time totalizer", () => {
    const totals = buildTotals(
      [
        submission({ id: 9, record: 10 }),
        submission({ id: 2, record: 10 }),
      ],
      false,
      100,
    );

    // the time comparator returns -1 for a tie, which reverses the ascending id order the mapping iterates in. this is what the
    // procedure this function replaces did, so the leaderboards are unchanged
    assertEquals(totals.map((total) => total.profile.id), [9, 2]);
  });
});
