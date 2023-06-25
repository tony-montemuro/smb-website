/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const ProfileRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryProfiles - async function that makes a call to supabase to get an array of all the profiles
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of profiles is simply returned
    // otherwise, this function throws an error, which should be handled by caller function
    const queryProfiles = async () => {
        try {
            const { data: profiles, error, status } = await supabase
                .from("profile")
                .select(`
                    id,
                    username,
                    bio,
                    birthday,
                    country (iso2, name), 
                    youtube_url, 
                    twitch_url,
                    discord,
                    featured_video,
                    video_description
                `)
                .order("username");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return profiles;

        } catch(error) {
            // throw error to be handled by caller
            throw error;
        }
    };

    // FUNCTION 2: queryUserProfile - async function that makes a call to supabase to get the profile object for a given user
    // PRECONDITIONS (1 parameter):
    // 1.) userId - a string corresponding to the uuid of a user, typically the currently signed-in user
    // 2.) addMessage - a function that is used to add messages to the messages array defined in `App.js`. used in the event
    // of an authenticated user who has no profile yet
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the profile object is simply returned
    // otherwise, an error is thrown to be handled by the caller function
    const queryUserProfile = async (userId, addMessage) => {
        try {
            const { data: profile, error } = await supabase
                .from("profile")
                .select(`
                    id,
                    username,
                    country (iso2, name),
                    youtube_url,
                    twitch_url,
                    discord,
                    bio,
                    birthday,
                    featured_video,
                    video_description
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
                addMessage("Welcome to SMBElite! Please create your profile to get started!", "success");
                return null;
            } 
            
            // general case: throw error, which will be handled by caller function
            else {
                throw error;
            }
        }
    };

    return { queryProfiles, queryUserProfile };
};

/* ===== EXPORTS ===== */
export default ProfileRead;