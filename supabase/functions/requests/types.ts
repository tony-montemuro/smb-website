/* ===== IMPORTS ===== */
import type { SupabaseContext } from "@supabase/server";

/* ===== REQUESTS ===== */

// the kind of request a user can file
export type RequestType = "feature" | "bug";

// the parameters of the submit route
export type RequestParams = {
  type: RequestType;
  title: string;
  description: string;
};

/* ===== LINEAR ===== */

// the workspace coordinates of the tracker, each of which is held as a secret rather than committed, since a workspace change
// should be a secret update rather than a deploy
export type LinearConfig = {
  apiKey: string;
  teamId: string;
  projectId: string;
  bugLabelId: string;
  featureLabelId: string;
};

// the `IssueCreateInput` of the `issueCreate` mutation. only the fields this function sets are declared
export type IssueCreateInput = {
  title: string;
  description: string;
  teamId: string;
  projectId: string;
  labelIds: string[];
};

// the issue a request was filed as. only what a caller needs to point at that issue is declared
export type FiledIssue = {
  identifier: string;
  url: string;
};

// the response of the `issueCreate` mutation. NOTE: linear answers a failed mutation with a 200, and reports the failure in
// `errors`, so a response with no `errors` can still carry an unsuccessful `issueCreate`
export type IssueCreateResponse = {
  data?: { issueCreate?: { success: boolean; issue?: FiledIssue } };
  errors?: { message: string }[];
};

// the outcome of filing an issue. `filed` is what the caller was promised, and `issue` is null whenever the mutation failed, and
// also on the rare success which answers without an issue
export type IssueCreateResult = {
  filed: boolean;
  issue: FiledIssue | null;
};

/* ===== DISCORD ===== */

// an embed of a discord message, which is how a notification carries the request. only the fields a notification sets are declared
export type DiscordEmbed = {
  title: string;
  url: string;
  description: string;
  color: number;
  fields: { name: string; value: string; inline: boolean }[];
};

// the body of an `Execute Webhook` call. `allowed_mentions` is what disarms the mentions of the arbitrary text an embed carries
export type DiscordMessage = {
  allowed_mentions: { parse: string[] };
  embeds: DiscordEmbed[];
};

/* ===== PLATFORM ===== */

// the background task api of the platform, which keeps an isolate alive until a task started during a request finishes. it is
// declared here because the ambient declaration of `@supabase/functions-js/edge-runtime.d.ts` does not survive a type check, and
// it is optional because the global is absent outside the platform, which includes `deno test`
export type EdgeRuntimeGlobal = {
  EdgeRuntime?: { waitUntil: (task: Promise<unknown>) => void };
};

/* ===== DATABASE ===== */

// the profile which a request is attributed to
export type Requester = {
  id: number;
  username: string;
};

// the tables and procedures which this function uses. only what is in use is declared, since the full schema is generated code
// which the function has no need for
export type Database = {
  public: {
    Tables: {
      profile: {
        Row: { id: number; username: string; user_id: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      consume_request_token: {
        Args: Record<PropertyKey, never>;
        Returns: number | null;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

// the context of a request, which carries the caller scoped client and the claims of the caller
export type Context = SupabaseContext<Database>;

// the caller scoped client which every query runs through
export type Client = Context["supabase"];
