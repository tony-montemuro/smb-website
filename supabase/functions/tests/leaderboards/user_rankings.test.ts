/* ===== IMPORTS ===== */
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import type { Mode, RankedSubmission } from "../../leaderboards/types.ts";
import { buildUserRankings } from "../../leaderboards/user_rankings.ts";

/* ===== CONSTANTS ===== */

const PROFILE_ID = 5;

const MODES: Mode[] = [
  {
    name: "beginner",
    levels: [
      { name: "beginner_1", timer_type: "sec_csec" },
      { name: "beginner_2", timer_type: "sec_csec" },
    ],
  },
  {
    name: "advanced",
    levels: [{ name: "advanced_1", timer_type: "sec_csec" }],
  },
];

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
  id: PROFILE_ID,
  username: "user",
  country: "US",
  record: 1,
  submitted_at: "2024-01-01T12:00:00.000000+00:00",
  live: true,
  position: 1,
  ...fields,
});

/* ===== TESTS ===== */

describe("buildUserRankings", () => {
  it("returns one ranking per level, keyed by mode", () => {
    const rankings = buildUserRankings([], MODES, PROFILE_ID);

    assertEquals(Object.keys(rankings), ["beginner", "advanced"]);
    assertEquals(rankings.beginner.length, 2);
    assertEquals(rankings.advanced.length, 1);
  });

  it("leaves a level the profile has no submission for empty", () => {
    const rankings = buildUserRankings([], MODES, PROFILE_ID);

    assertEquals(rankings.beginner[0], {
      level: MODES[0].levels[0],
      record: null,
      date: null,
      position: null,
    });
  });

  it("assigns the record, date, and position of the submission of the profile", () => {
    const rankings = buildUserRankings(
      [submission({ level_id: "beginner_1", record: 12.34, position: 3 })],
      MODES,
      PROFILE_ID,
    );

    assertEquals(rankings.beginner[0], {
      level: MODES[0].levels[0],
      record: 12.34,
      date: "2024-01-01T12:00:00.000Z",
      position: 3,
    });
  });

  it("ignores the submissions of every other profile", () => {
    const rankings = buildUserRankings(
      [
        submission({ level_id: "beginner_1", id: 1, record: 99, position: 1 }),
        submission({
          level_id: "beginner_1",
          id: PROFILE_ID,
          record: 50,
          position: 2,
        }),
        submission({ level_id: "beginner_1", id: 2, record: 10, position: 3 }),
      ],
      MODES,
      PROFILE_ID,
    );

    assertEquals(rankings.beginner[0].record, 50);
    assertEquals(rankings.beginner[0].position, 2);
  });

  it("normalizes the date to millisecond precision", () => {
    const rankings = buildUserRankings(
      [
        submission({
          level_id: "beginner_1",
          submitted_at: "2023-12-22T07:05:13.873412+00:00",
        }),
      ],
      MODES,
      PROFILE_ID,
    );

    assertEquals(rankings.beginner[0].date, "2023-12-22T07:05:13.873Z");
  });

  it("advances through the submissions of every mode", () => {
    const rankings = buildUserRankings(
      [
        submission({ level_id: "beginner_1", record: 1 }),
        submission({ level_id: "beginner_2", record: 2 }),
        submission({ level_id: "advanced_1", record: 3 }),
      ],
      MODES,
      PROFILE_ID,
    );

    assertEquals(rankings.beginner.map((entry) => entry.record), [1, 2]);
    assertEquals(rankings.advanced.map((entry) => entry.record), [3]);
  });

  it("returns nothing but empty rankings for a profile with no submissions", () => {
    const rankings = buildUserRankings(
      [submission({ level_id: "beginner_1", id: 1 })],
      MODES,
      PROFILE_ID,
    );

    assertEquals(
      Object.values(rankings).flat().every((entry) => entry.record === null),
      true,
    );
  });
});
