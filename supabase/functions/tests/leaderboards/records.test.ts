/* ===== IMPORTS ===== */
import { assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { buildRecordTable } from "../../leaderboards/records.ts";
import type { Mode, RecordSubmission } from "../../leaderboards/types.ts";

/* ===== CONSTANTS ===== */

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

// FUNCTION 1: submission - function that generates a record submission, with each unspecified field defaulted
// PRECONDITIONS (1 parameter):
// 1.) fields: the fields of the submission which the test cares about
// POSTCONDITIONS (1 possible outcome):
// a complete record submission is returned
const submission = (
  fields: Partial<RecordSubmission>,
): RecordSubmission => ({
  id: "2024-01-01T12:00:00.000000+00:00",
  game_id: "smb1",
  level_id: "beginner_1",
  category: "main",
  profile_id: 1,
  username: "user",
  country: "US",
  record: 1,
  submitted_at: "2024-01-01T12:00:00.000000+00:00",
  live: true,
  ...fields,
});

/* ===== TESTS ===== */

describe("buildRecordTable", () => {
  it("returns one record per level, keyed by mode", () => {
    const recordTable = buildRecordTable([], MODES);

    assertEquals(Object.keys(recordTable), ["beginner", "advanced"]);
    assertEquals(recordTable.beginner.length, 2);
    assertEquals(recordTable.advanced.length, 1);
  });

  it("leaves a level without submissions empty", () => {
    const recordTable = buildRecordTable([], MODES);

    assertEquals(recordTable.beginner[0], {
      level: MODES[0].levels[0],
      profiles: [],
      record: null,
    });
    assertEquals(recordTable.beginner[1], {
      level: MODES[0].levels[1],
      profiles: [],
      record: null,
    });
    assertEquals(recordTable.advanced[0], {
      level: MODES[1].levels[0],
      profiles: [],
      record: null,
    });
  });

  it("assigns the record and the profile which holds it", () => {
    const recordTable = buildRecordTable(
      [
        submission({
          level_id: "beginner_1",
          profile_id: 5,
          username: "tony",
          country: "US",
          record: 12.34,
        }),
      ],
      MODES,
    );

    assertEquals(recordTable.beginner[0].record, 12.34);
    assertEquals(recordTable.beginner[0].profiles, [
      {
        country: "US",
        id: 5,
        username: "tony",
        submission_id: "2024-01-01T12:00:00.000Z",
      },
    ]);
  });

  it("keeps every profile which shares the record of a level", () => {
    const recordTable = buildRecordTable(
      [
        submission({ level_id: "beginner_1", profile_id: 5, record: 12.34 }),
        submission({ level_id: "beginner_1", profile_id: 6, record: 12.34 }),
      ],
      MODES,
    );

    assertEquals(recordTable.beginner[0].profiles.map((p) => p.id), [5, 6]);
    assertEquals(recordTable.beginner[0].record, 12.34);
  });

  it("ignores a profile which is already credited with the record of a level", () => {
    const recordTable = buildRecordTable(
      [
        submission({ level_id: "beginner_1", profile_id: 5, record: 12.34 }),
        submission({ level_id: "beginner_1", profile_id: 5, record: 12.34 }),
      ],
      MODES,
    );

    assertEquals(recordTable.beginner[0].profiles.length, 1);
  });

  it("normalizes the submission id to millisecond precision", () => {
    const recordTable = buildRecordTable(
      [
        submission({
          level_id: "beginner_1",
          id: "2023-12-22T07:05:13.873412+00:00",
        }),
      ],
      MODES,
    );

    assertEquals(
      recordTable.beginner[0].profiles[0].submission_id,
      "2023-12-22T07:05:13.873Z",
    );
  });

  it("advances through the submissions of every mode", () => {
    const recordTable = buildRecordTable(
      [
        submission({ level_id: "beginner_1", record: 1 }),
        submission({ level_id: "beginner_2", record: 2 }),
        submission({ level_id: "advanced_1", record: 3 }),
      ],
      MODES,
    );

    assertEquals(recordTable.beginner.map((entry) => entry.record), [1, 2]);
    assertEquals(recordTable.advanced.map((entry) => entry.record), [3]);
  });

  it("throws when a submission arrives out of level order", () => {
    // the cursor only moves forwards, so it never reaches the `beginner_1` submission. the record table would otherwise be
    // returned with that record silently missing
    assertThrows(
      () =>
        buildRecordTable(
          [
            submission({ level_id: "beginner_2", record: 2 }),
            submission({ level_id: "beginner_1", record: 1 }),
          ],
          MODES,
        ),
      Error,
      "1 record submissions were not assigned to a level",
    );
  });

  it("throws when a submission belongs to no level of any mode", () => {
    assertThrows(
      () => buildRecordTable([submission({ level_id: "expert_1" })], MODES),
      Error,
      "were not assigned to a level",
    );
  });
});
