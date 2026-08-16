/* ===== IMPORTS ===== */
import type { Client, RoadmapIssue } from "./types.ts";

/* ===== FUNCTIONS ===== */

// FUNCTION 1: syncRoadmapIssue - function that writes the issue a delivery carries onto the roadmap
// PRECONDITIONS (2 parameters):
// 1.) client: the supabase client which the query runs through
// 2.) issue: the row the delivery carries
// POSTCONDITIONS (2 possible outcomes):
// if the query is successful, the row is written, unless the roadmap already holds a newer copy of the same issue
// otherwise, this function throws an error, which should be handled by the caller function
export const syncRoadmapIssue = async (
  client: Client,
  issue: RoadmapIssue,
): Promise<void> => {
  const { error } = await client.rpc("sync_roadmap_issue", issue);

  // error handling
  if (error) {
    throw error;
  }
};

// FUNCTION 2: removeRoadmapIssue - function that takes an issue off the roadmap
// PRECONDITIONS (3 parameters):
// 1.) client: the supabase client which the query runs through
// 2.) linearId: the id linear gives the issue
// 3.) updatedAt: when the delivery says the issue last changed, or null when it carries no usable timestamp
// POSTCONDITIONS (2 possible outcomes):
// if the query is successful, the row is deleted, unless the roadmap holds a copy which changed after the delivery was sent
// otherwise, this function throws an error, which should be handled by the caller function
export const removeRoadmapIssue = async (
  client: Client,
  linearId: string,
  updatedAt: string | null,
): Promise<void> => {
  const { error } = await client.rpc("remove_roadmap_issue", {
    p_linear_id: linearId,
    p_updated_at: updatedAt,
  });

  // error handling
  if (error) {
    throw error;
  }
};
