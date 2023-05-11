/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const ProfileRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryProfiles - async function that makes a call to supabase to get an array of all the profiles
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of profiles is simply returned
    // otherwise, the user is alerted of the error, and an empty array is returned
    const queryProfiles = async () => {
        try {
            const { data: profiles, error, status } = await supabase
                .from("profiles")
                .select(`
                    id, 
                    username,
                    bio,
                    birthday,
                    country (iso2, name), 
                    youtube_url, 
                    twitch_url,
                    discord,
                    avatar_url,
                    featured_video,
                    video_description
                `);

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return profiles;

        } catch(error) {
            console.log(error);
            alert(error.message);
            return [];
        }
    };

    // FUNCTION 2: queryUserProfile - async function that makes a call to supabase to get the profile object for a given user
    // PRECONDITIONS (1 parameter):
    // 1.) userId - a string corresponding to the uuid of a user, typically the currently signed-in user
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the profile object is simply returned
    // otherwise, the user is alerted of the error, and null is returned
    const queryUserProfile = async (userId) => {
        try {
            const { data: profile, error } = await supabase
                .from("profiles")
                .select(`
                    username,
                    country (iso2, name),
                    youtube_url,
                    twitch_url,
                    avatar_url,
                    discord,
                    bio,
                    birthday,
                    featured_video,
                    video_description
                `)
                .eq("id", userId)
                .single()

            // error handling
            if (error) {
                throw error;
            }

            // return data
            return profile;
            
        } catch (error) {
            // special case: user is authenticated, but has not created a profile yet
            if (error.code === "PGRST116") {
                alert("Welcome to SMBElite! Please create your profile to get started!");
            } else {
                console.log(error);
                alert(error.message);
            }
            return null;
        }
    };

    return { queryProfiles, queryUserProfile };
};

/* ===== EXPORTS ===== */
export default ProfileRead;