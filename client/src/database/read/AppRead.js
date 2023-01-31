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
                .select("id, username, country (iso2, name), youtube_url, twitch_url, avatar_url");

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
    }

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
    }

    // function that queries the mod table to see if current user is a mod
    const loadMods = async (userId) => {
        try {
            const { data: mods, error, status } = await supabase
                .from("moderator")
                .select("user_id")
                .eq("user_id", userId);

            // error handling
            if (error && status !== 406) {
                throw error;
            }
        
            // if data is not empty, this means match was found -> user is mod
            if (mods.length > 0) {
                return true;
            } else {
                return false;
            }
            
        } catch (error) {
            console.log(error);
            alert(error.message);
            return false;
        }
    };

    // function that loads all the notifications for a given user
    const loadUserNotifications = async (userId) => {
        try {
            const { data: notificationsList, error, status } = await supabase
                .from("notification")
                .select(`
                    id,
                    user_id,
                    level (name, misc, mode (game (abb, name))),
                    moderator:profiles (id, username),
                    type,
                    notif_type,
                    notif_date,
                    message,
                    old_record,
                    record,
                    old_submitted_at,
                    submitted_at,
                    old_monkey:monkey!notification_old_monkey_fkey (monkey_name),
                    monkey:monkey!notification_monkey_fkey (monkey_name),
                    old_region:region!notification_old_region_fkey (region_name),
                    region:region!notification_region_fkey (region_name),
                    old_proof,
                    proof,
                    old_live,
                    live,
                    old_approved,
                    approved
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

    return { 
        loadCountries, 
        loadGames, 
        loadLevels, 
        loadGameMonkeys,
        loadAllMonkeys, 
        loadProfiles,
        loadGameRegions,
        loadAllRegions,
        loadMods, 
        loadUserNotifications
    };
};

export default AppRead;