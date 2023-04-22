/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const AppRead = () => {
    /* ===== FUNCTIONS ===== */
    
    // FUNCTION 1: loadCountries - async function that makes a call to supabase to get an array of all the countries
    // PRECONDTIONS: NONE
    // POSTCONDTIONS (2 possible outcomes):
    // if the query is successful, the list of countries is simply returned
    // otherwise, the user is alerted of the error, and an empty array is returned
    const loadCountries = async () => {
        try {
            const { data: countryList, error, status } = await supabase
                .from("countries")
                .select("*")
                .order("name");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return countryList;

        } catch(error) {
            console.log(error);
            alert(error.message);
            return [];
        }
    };

    // FUNCTION 2: loadGames - async function that makes a call to supabase to get an array of all the games
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of games is simply returned
    // otherwise, the user is alerted of the error, and an empty array is returned
    const loadGames = async () => {
        try {
            const { data: gameList, error, status } = await supabase
                .from("game")
                .select(`
                    abb,
                    custom, 
                    game_monkey (
                        monkey (
                            id,
                            monkey_name
                        )
                    ),
                    game_region (
                        region (
                            id,
                            region_name
                        )
                    ),
                    mode (
                        level (
                            chart_type,
                            misc,
                            name,
                            time
                        ),
                        misc,
                        name
                    ),
                    name,
                    release_date
                `)
                .order("id")
                .order("id", { foreignTable: "mode", ascending: true })
                .order("name", { foreignTable: "mode", ascending: true })
                .order("id", { foreignTable: "mode.level", ascending: true });

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return the games
            return gameList;

        } catch (error) {
            console.log(error);
            alert(error.message);
            return [];
        }
    };

    // FUNCTION 3: loadModerators - async function that makes a call to supabase to get an array of all the moderators
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of moderators is simply returned
    // otherwise, the user is alerted of the error, and an empty array is returned
    const loadModerators = async () => {
        try {
            const { data: moderatorList, error, status } = await supabase
                .from("moderator")
                .select("*");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return moderatorList;

        } catch (error) {
            console.log(error);
            alert(error.message);
            return [];
        }
    };

    // FUNCTION 4: loadProfiles - async function that makes a call to supabase to get an array of all the profiles
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of profiles is simply returned
    // otherwise, the user is alerted of the error, and an empty array is returned
    const loadProfiles = async () => {
        try {
            const { data: profilesList, error, status } = await supabase
                .from("profiles")
                .select(`
                    id, 
                    username,
                    bio,
                    country (iso2, name), 
                    youtube_url, 
                    twitch_url,
                    discord,
                    avatar_url
                `);

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return profilesList;

        } catch(error) {
            console.log(error);
            alert(error.message);
            return [];
        }
    };

    // FUNCTION 5: loadUserNotifications - async function that makes a call to supabase to get an array of all notifications for
    // a given user
    // PRECONDITIONS (1 parameter):
    // 1.) userId - a string corresponding to the uuid of a user, typically the currently signed-in user
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of notifications is simply returned
    // otherwise, the user is alerted of the error, and an empty array is returned
    const loadUserNotifications = async (userId) => {
        try {
            const { data: notificationsList, error, status } = await supabase
                .from("notification")
                .select(`
                    notif_date,
                    notif_type,
                    creator:profiles!notification_creator_id_fkey (id, username),
                    message,
                    submission:all_submission (
                        user:profiles (id, username),
                        record,
                        region (region_name),
                        submitted_at,
                        monkey (monkey_name),
                        proof,
                        comment,
                        live,
                        position,
                        all_position
                    ),
                    level (name, misc, mode (game (abb, name))),
                    score,
                    record
                `)
                .eq("user_id", userId)
                .order("notif_date", { ascending: false });

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return notificationsList;

        } catch (error) {
            console.log(error);
            alert(error.message);
            return [];
        }
    };

    // FUNCTION 6: loadUserProfile - async function that makes a call to supabase to get the profile object for a given user
    // PRECONDITIONS (1 parameter):
    // 1.) userId - a string corresponding to the uuid of a user, typically the currently signed-in user
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the profile object is simply returned
    // otherwise, the user is alerted of the error, and null is returned
    const loadUserProfile = async (userId) => {
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
                    bio
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

    // FUNCTION 7: isModerator - async function that makes a call to supabase to determine whether or not the given user is a moderator
    // PRECONDITIONS (1 parameter):
    // 1.) userId - a string corresponding to the uuid of a user, typically the currently signed-in user
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, return a boolean value: true if the user is a moderator, and false otherwise
    // otherwise, the user is alerted of the error, and false is returned
    const isModerator = async (userId) => {
        try {
            const { data: moderator, error } = await supabase
                .from("moderator")
                .select("user_id")
                .eq("user_id", userId)
                .maybeSingle();

            // error handling
            if (error) {
                throw error;
            }

            // return true if moderator returns an object; false otherwise
            return moderator ? true : false;
        
        } catch (error) {
            console.log(error);
            alert(error.message);
            return false;
        }
    };

    return { 
        loadCountries, 
        loadGames,
        loadModerators,
        loadProfiles,
        loadUserNotifications,
        loadUserProfile,
        isModerator
    };
};

/* ===== EXPORTS ===== */
export default AppRead;