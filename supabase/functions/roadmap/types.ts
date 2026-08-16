/* ===== IMPORTS ===== */
import type { SupabaseContext } from "@supabase/server";

/* ===== LINEAR ===== */

// the configuration of the ingest, each value held as a secret rather than committed. neither is optional: a webhook with no
// secret would have to accept unverified writes, and one with no label id could not tell a public issue from a private one
export type RoadmapConfig = {
  webhookSecret: string;
  publicLabelId: string;
};

// the issue a delivery carries, normalized out of the raw json. every field is nullable, since a payload is arbitrary json until
// it has been read, and the caller decides which absences it can tolerate
export type IssueData = {
  id: string | null;
  identifier: string | null;
  title: string | null;
  stateName: string | null;
  stateType: string | null;
  projectName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  completedAt: string | null;
  archivedAt: string | null;
  labelIds: string[];
};

// a webhook delivery, normalized. `webhookTimestamp` is epoch milliseconds, and it is what the replay window is measured against
export type WebhookPayload = {
  action: string;
  type: string;
  webhookTimestamp: number;
  data: IssueData;
};

/* ===== DATABASE ===== */

// the arguments of `sync_roadmap_issue`, which are the row it writes. the names are the prefixed parameters of the procedure,
// since an unprefixed name collides with the column of the same name inside its `ON CONFLICT` clause
export type RoadmapIssue = {
  p_linear_id: string;
  p_identifier: string;
  p_title: string;
  p_state_name: string;
  p_state_type: string;
  p_project_name: string | null;
  p_created_at: string;
  p_updated_at: string;
  p_completed_at: string | null;
};

// the tables and procedures which this function uses. only what is in use is declared, since the full schema is generated code
// which the function has no need for
export type Database = {
  public: {
    Tables: {
      roadmap_issue: {
        Row: {
          linear_id: string;
          identifier: string;
          title: string;
          state_name: string;
          state_type: string;
          project_name: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      sync_roadmap_issue: {
        Args: RoadmapIssue;
        Returns: undefined;
      };
      remove_roadmap_issue: {
        Args: { p_linear_id: string; p_updated_at: string | null };
        Returns: undefined;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

// the context of a request, which carries both the caller scoped client and the admin client the ingest writes through
export type Context = SupabaseContext<Database>;

// the client which every query runs through. the ingest is given the admin one, since the caller is linear rather than a user,
// and the writes have to bypass row level security
export type Client = Context["supabaseAdmin"];
