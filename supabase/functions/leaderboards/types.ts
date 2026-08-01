/* ===== IMPORTS ===== */
import type { SupabaseContext } from "@supabase/server";

/* ===== HELPER FUNCTION RESULTS ===== */

// a row of `get_ranked_submissions_json`. NOTE: `id` is the id of the profile which owns the submission, and `position` is the
// rank of the submission within its level
export type RankedSubmission = {
  game_id: string;
  level_id: string;
  category: string;
  id: number;
  username: string;
  country: string;
  record: number;
  submitted_at: string;
  live: boolean;
  position: number;
};

// a row of `get_record_submissions_json`. NOTE: `id` is the id of the submission, which is a timestamp, whereas `profile_id` is
// the id of the profile which owns the submission
export type RecordSubmission = {
  id: string;
  game_id: string;
  level_id: string;
  category: string;
  profile_id: number;
  username: string;
  country: string;
  record: number;
  submitted_at: string;
  live: boolean;
};

// a level of a mode returned by `get_category_levels_by_mode`
export type Level = {
  name: string;
  timer_type: string;
};

// a mode returned by `get_category_levels_by_mode`
export type Mode = {
  name: string;
  levels: Level[];
};

/* ===== REQUESTS ===== */

// the parameters shared by each leaderboard route
export type LeaderboardParams = {
  abb: string;
  category: string;
  score: boolean;
  liveOnly: boolean;
  version: number | null;
};

/* ===== RESPONSES ===== */

// a profile which holds the record of a level. NOTE: `submission_id` is an ISO timestamp, with millisecond precision
export type RecordProfile = {
  country: string;
  id: number;
  username: string;
  submission_id: string;
};

// the record of a single level, and each profile which holds it. NOTE: `record` is null, and `profiles` empty, for a level with
// no submissions
export type RecordEntry = {
  level: Level;
  profiles: RecordProfile[];
  record: number | null;
};

// the records of a game, keyed by the name of each mode
export type RecordTable = Record<string, RecordEntry[]>;

// a profile which appears in the totalizer of a game
export type TotalProfile = {
  id: number;
  username: string;
  country: string;
};

// the total of a single profile, and the position that total earns. NOTE: a time total is negative, since it is the sum of the
// time remaining across every level of the category
export type Total = {
  profile: TotalProfile;
  total: number;
  position: number;
};

/* ===== DATABASE ===== */

// the procedures which this function calls. only the procedures in use are declared, since the full schema is generated code
// which the function has no need for
export type Database = {
  public: {
    Tables: {
      category: {
        Row: { abb: string; practice: boolean };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      get_category_levels_by_mode: {
        Args: { game_name: string; category_name: string; is_score: boolean };
        Returns: { name: string }[];
      };
      get_category_time: {
        Args: { game_name: string; category_name: string };
        Returns: number;
      };
      get_ranked_submissions_json: {
        Args: {
          game_name: string;
          category_name: string;
          is_score: boolean;
          live_only: boolean;
          version_key: number | null;
        };
        Returns: RankedSubmission[];
      };
      get_record_submissions_json: {
        Args: {
          game_name: string;
          category_name: string;
          is_score: boolean;
          live_only: boolean;
          version_key: number | null;
        };
        Returns: RecordSubmission[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

// the caller scoped client which every query runs through
export type Client = SupabaseContext<Database>["supabase"];
