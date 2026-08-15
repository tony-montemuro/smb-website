/* ===== IMPORTS ===== */
import type { Client, Requester } from "./types.ts";

/* ===== FUNCTIONS ===== */

// FUNCTION 1: getRequesterProfile - function that grabs the profile which a request should be attributed to
// PRECONDITIONS (2 parameters):
// 1.) client: the supabase client which the query runs through
// 2.) userId: the uuid of the caller, taken from their token
// POSTCONDITIONS (3 possible outcomes):
// if the query is successful, and the caller has a profile, the profile is returned
// if the query is successful, but the caller has no profile yet, null is returned
// otherwise, this function throws an error, which should be handled by the caller function
export const getRequesterProfile = async (
  client: Client,
  userId: string,
): Promise<Requester | null> => {
  const { data: profile, error } = await client
    .from("profile")
    .select("id, username")
    .eq("user_id", userId)
    .maybeSingle();

  // error handling
  if (error) {
    throw error;
  }

  return profile;
};

// FUNCTION 2: consumeRequestToken - function that spends a single request token of the caller
// PRECONDITIONS (1 parameter):
// 1.) client: the supabase client which the query runs through
// POSTCONDITIONS (3 possible outcomes):
// if the caller had a token to spend, or is exempt from the allowance, the number of tokens they have left is returned
// if the caller has no tokens left, null is returned
// otherwise, this function throws an error, which should be handled by the caller function
export const consumeRequestToken = async (
  client: Client,
): Promise<number | null> => {
  const { data: numRequestTokens, error } = await client.rpc(
    "consume_request_token",
  );

  // error handling
  if (error) {
    throw error;
  }

  return numRequestTokens;
};
