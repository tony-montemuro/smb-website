import { supabase } from "./components/SupabaseClient/SupabaseClient";

const Load = () => {
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
    const loadCountries = async(setCountries) => {
        try {
            const { data: countryList, error, status } = await supabase
                .from("countries")
                .select("*")
                .order("name");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // update countries state
            setCountries(countryList);

        } catch(error) {
            console.log(error);
            alert(error.message);
        }
    };

    // function that loads all the game data
    const loadGames = async(setGames) => {
        try {
            const { data: gameList, error, status } = await supabase
                .from("game")
                .select("abb, name, custom")
                .order("id");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // update games state
            setGames(gameList);

        } catch(error) {
            console.log(error);
            alert(error.message);
        }
    };

    // function that loads all the level data
    const loadLevels = async(setLevels) => {
        try {
            const { data: levelList, error, status } = await supabase
                .from("level")
                .select("game, name, mode, misc, chart_type, time")
                .order("game")
                .order("id");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // update levels state
            setLevels(levelList);

        } catch(error) {
            console.log(error);
            alert(error.message);
        }
    };

    // function that loads all the monkey data
    const loadMonkeys = async(setMonkeys) => {
        try {
            const { data: monkeyList, error, status } = await supabase
                .from("monkey")
                .select("*");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // update monkeys state
            setMonkeys(monkeyList);
            
        } catch(error) {
            console.log(error);
            alert(error.message);
        }
    };

    // function that loads all the profiles data
    const loadProfiles = async(setProfiles) => {
        try {
            const { data: profileList, error, status } = await supabase
                .from("profiles")
                .select("*");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // update profiles state
            setProfiles(profileList);

        } catch(error) {
            console.log(error);
            alert(error.message);
        }
    };

    return { 
        queryMods, 
        loadCountries, 
        loadGames, 
        loadLevels, 
        loadMonkeys, 
        loadProfiles
    };
};

export default Load;