import { supabase } from "../SupabaseClient";

const AppRead = () => {
    // function that loads all the countries data
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
        }
        return [];
    };

    // function that loads all the game data
    const loadGames = async () => {
        try {
            const { data: gamesList, error, status } = await supabase
                .from("game")
                .select("abb, name, custom, release_date")
                .order("id");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return gamesList;

        } catch(error) {
            console.log(error);
            alert(error.message);
        }
        return [];
    };

    // function that loads all the level data
    const loadLevels = async () => {
        try {
            const { data: levelsList, error, status } = await supabase
                .from("level")
                .select("game, name, mode, misc, chart_type, time")
                .order("game")
                .order("id");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return levelsList;

        } catch(error) {
            console.log(error);
            alert(error.message);
        }
        return [];
    };

    // function that loads all the moderators
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
        }
    };

    // function that loads all the gameMonkey data
    const loadGameMonkeys = async () => {
        try {
            const { data: gameMonkeysList, error, status } = await supabase
                .from("game_monkey")
                .select("*")
                .order("game")
                .order("monkey");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return gameMonkeysList;

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
        return [];
    };

    // function that loads all the monkey data
    const loadAllMonkeys = async () => {
        try {
            const { data: monkeysList, error, status } = await supabase
                .from("monkey")
                .select("*")
                .order("id");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return monkeysList;
            
        } catch(error) {
            console.log(error);
            alert(error.message);
        }
        return [];
    };

    // function that loads all the profiles data
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
        }
        return [];
    };

    // function that loads all the region data
    const loadGameRegions = async () => {
        try {
            const { data: gameRegionsList, error, status } = await supabase
                .from("game_region")
                .select("*")
                .order("game")
                .order("region");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return gameRegionsList;

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
        return [];
    };

    // function that loads all the region data
    const loadAllRegions = async () => {
        try {
            const { data: allRegionsList, error, status } = await supabase
                .from("region")
                .select("*")
                .order("id");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return allRegionsList;

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
        return [];
    };

    // function that loads all the notifications for a given user
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
        }
    };

    // function that loads the profile for a particular user
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
            console.log(error);
            alert(error.message);
        }
    };

    // function that determines if the current user should have moderator privileges, based on the userId parameter
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
        }
    };

    // function that loads all the data for each game, and returns it as an array of objects
    const newLoadGames = async () => {
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
        }
    };

    return { 
        loadCountries, 
        loadGames, 
        loadLevels, 
        loadModerators,
        loadGameMonkeys,
        loadAllMonkeys, 
        loadProfiles,
        loadGameRegions,
        loadAllRegions,
        loadUserNotifications,
        loadUserProfile,
        isModerator,
        newLoadGames
    };
};

export default AppRead;