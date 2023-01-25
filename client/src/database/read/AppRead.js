import { supabase } from "../SupabaseClient";

const AppRead = () => {
    // function that queries the mod table to see if current user is a mod
    const queryMods = async (setIsMod) => {
        try {
            // initialize variables
            const userId = supabase.auth.user() ? supabase.auth.user().id : null;

            // perform query, if necessary
            if (userId) {
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
                    setIsMod(true);
                } else {
                    setIsMod(false);
                }
            } else {
                setIsMod(false);
            }
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

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
                .select("*");

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
                .select("*");

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

    return { 
        queryMods, 
        loadCountries, 
        loadGames, 
        loadLevels, 
        loadGameMonkeys,
        loadAllMonkeys, 
        loadProfiles
    };
};

export default AppRead;