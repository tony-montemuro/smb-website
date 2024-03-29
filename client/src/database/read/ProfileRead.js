/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const ProfileRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryUserProfile - async function that makes a call to supabase to get the profile object for a given user
    // PRECONDITIONS (1 parameter):
    // 1.) userId - a string corresponding to the uuid of a user, typically the currently signed-in user
    // 2.) addMessage - a function that is used to render message to user. used in the case of a new authenticated user w/no profile
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the profile object is simply returned
    // otherwise, an error is thrown to be handled by the caller function
    const queryUserProfile = async (userId, addMessage) => {
        try {
            const { data: profile, error } = await supabase
                .from("profile")
                .select(`
                    administrator (profile_id),
                    bio,
                    birthday,
                    country (iso2, name),
                    discord,
                    featured_video,
                    game!game_profile (abb, name),
                    id,
                    report_token,
                    twitch_username,
                    twitter_handle,
                    username,
                    video_description,
                    youtube_handle
                `)
                .eq("user_id", userId)
                .single();

            // error handling
            if (error) {
                throw error;
            }

            // return data
            return profile;
            
        } catch (error) {
            // special case: user is authenticated, but has not created a profile yet
            if (error.code === "PGRST116") {
                addMessage("Welcome to SMBElite! If a profile already exists under your name (check the Users page), contact TonySMB via Discord [tonysmb] or Email [tonyamontemuro@gmail.com] to sync your account to that profile. Otherwise, create your profile to get started!", "info", 30000);
                return null;
            } 
            
            // general case: throw error, which will be handled by caller function
            else {
                throw error;
            }
        }
    };

    // FUNCTION 2: searchForProfiles - function that grabs a subset of profiles, according to the users input
    // PRECONDITIONS (3 parameters):
    // 1.) userInput: a string, which a user has entered in an attempt to find a user profile. we use this value to attempt
    // to match 0 or more profiles to this value
    // 2.) start: an integer, representing the first profile to be selected
    // 3.) end: an integer, representing last profile to be selected
    // POSTCONDITIONS (2 returns, 2 possible outcomes):
    // if the query is successful, an object with two fields is returned:
        // 1.) profiles: an array of profile objects, which have a substring matching the user input (case-insensitive)
        // 2.) count: the total number of profiles that match the user input. in some cases, this number will be larger 
        // than `profiles.length`
    // if the query fails, this function throws an error, which should be handled by the caller function
    const searchForProfiles = async(userInput, start, end) => {
        try {
            const { data: profiles, count, error } = await supabase
                .from("profile")
                .select("country, discord, id, username, twitch_username, twitter_handle, youtube_handle", { count: "exact" })
                .ilike("username", `%${ userInput }%`)
                .order("username")
                .range(start, end);

            // error handling
            if (error) {
                throw error;
            }

            return { profiles, count };

        } catch (error) {
            throw error;
        };
    };

    // FUNCTION 3: queryProfileByList - code that takes an array of strings representing profile primary keys, and returns the matching
    // profiles
    // PRECONDITIONS (1 parameter):
    // 1.) ids: an array of profile `id` strings, each should correspond to a profile in the db
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, then this function will simply return the profile data
    // if the query is unsuccessful, then this function will throw an error, which should be handled by the caller function
    const queryProfileByList = async ids => {
        try {
            const { data: profiles, error } = await supabase
                .from("profile")
                .select("country, id, username")
                .in("id", ids)
                .order("username");

            // error handling
            if (error) {
                throw error;
            }

            return profiles;

        } catch (error) {
            // error should be handled by caller function
            throw error;
        };
    };

    return { queryUserProfile, searchForProfiles, queryProfileByList };
};

/* ===== EXPORTS ===== */
export default ProfileRead;