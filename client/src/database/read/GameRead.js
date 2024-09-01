/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const GameRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryGame - async function that makes a call to supabase to get data about a game given an abb
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string representing the unique identifier for a game
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, a object containing game data is returned
    // otherwise, this function will throw an error, which should be handled by the caller function
    const queryGame = async abb => {
        try {
            const { data: game, error } = await supabase
                .from("game")
                .select(`
                    abb,
                    creator (
                        country,
                        id,
                        username
                    ),
                    custom, 
                    download,
                    game_monkey (
                        monkey (
                            id,
                            monkey_name
                        )
                    ),
                    game_platform (
                        platform (
                            id,
                            platform_abb,
                            platform_name
                        )
                    ),
                    game_region (
                        region (
                            id,
                            region_name
                        )
                    ),
                    game_rule (
                        id,
                        rule (
                            id,
                            rule_name
                        )
                    ),
                    live_preference,
                    min_date,
                    mode (
                        level (
                            category,
                            chart_type,
                            name,
                            time,
                            timer_type
                        ),
                        category,
                        name
                    ),
                    name,
                    profile!game_profile (id, username, country),
                    release_date
                `)
                .order("custom")
                .order("release_date")
                .order("id", { foreignTable: "mode", ascending: true })
                .order("id", { foreignTable: "mode.level", ascending: true })
                .eq("abb", abb)
                .maybeSingle();

            // error handling
            if (error) {
                throw error;
            }

            // next, let's sort the list of profiles (game moderators) by username, as well as game_rules by id
            game.profile.sort((a, b) => a.username.localeCompare(b.username));
            game.game_rule.sort((a, b) => a.id - b.id);

            // return the game object
            return game;

        } catch (error) {
            // throw error to be handled by caller
            throw error;
        }
    };

    // FUNCTION 2: queryGamesForModerators - async function that makes a call to supabase to get an array of all the games, but only
    // a small subset of their data
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of games, with the list of it's moderators, is simply returned
    // otherwise, this function throws an error, which should be handled by the caller function
    const queryGamesForModerators = async () => {
        try {
            const { data: games, error } = await supabase
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
                    game_platform (
                        platform (
                            id,
                            platform_abb,
                            platform_name
                        )
                    ),
                    game_region (
                        region (
                            id,
                            region_name
                        )
                    ),
                    game_rule (
                        rule (
                            id,
                            rule_name
                        )
                    ),
                    mode (
                        category
                    ),
                    name,
                    moderators:profile!game_profile (id, username, country),
                    release_date
                `)
                .order("custom")
                .order("release_date")
                .order("name");

            // error handling
            if (error) {
                throw error;
            }

            // return the games
            return games;

        } catch (error) {
            // throw error to be handled by caller
            throw error;
        }
    };

    // FUNCTION 3: searchForGames - function that grabs a subset of games, according to the users input
    // PRECONDITIONS (4 parameters):
    // 1.) userInput: a string, which a user has entered in an attempt to find a user profile. we use this value to attempt
    // to match 0 or more games to this value
    // 2.) start: an integer, representing the first game to be selected
    // 3.) end: an integer, representing last game to be selected
    // 4.) gameTypeFilter: a value which determines how the games should be filtered. can be 3 values: "main", "custom", or undefined
    // POSTCONDITIONS (2 returns, 2 possible outcomes):
    // if the query is successful, an object with two fields is returned:
        // 1.) games: an array of gane objects, which have a substring matching the user input (case-insensitive)
        // 2.) count: the total number of games that match the user input. in some cases, this number will be larger 
        // than `games.length`
    // if the query fails, this function throws an error, which should be handled by the caller function
    const searchForGames = async (userInput, start, end, gameTypeFilter) => {
        // first, let's generate our `custom` field filter
        let customFilter = [];
        if (!gameTypeFilter || gameTypeFilter === "custom") {
            customFilter.push(true);
        }
        if (!gameTypeFilter || gameTypeFilter === "main") {
            customFilter.push(false)
        } 

        try {
            const { data: games, count, error } = await supabase
                .from("game")
                .select("abb, custom, name", { count: "exact" })
                .in("custom", customFilter)
                .or(`name.ilike.%${ userInput }%,abb.ilike.%${ userInput }%`)
                .order("custom")
                .order("release_date")
                .order("name")
                .range(start, end);

            // error handling
            if (error) {
                throw error;
            }

            return { games, count };

        } catch (error) {
            throw error;
        };
    };

    // FUNCTION 4: queryGameByList - code that takes an array of strings representing game primary keys, and returns the matching games
    // PRECONDITIONS (1 parameter):
    // 1.) abbs: an array of `abb` strings, each should correspond to a game in the db
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, then this function will simply return the game data
    // if the query is unsuccessful, then this function will throw an error, which should be handled by the caller function
    const queryGameByList = async abbs => {
        try {
            const { data: games, error } = await supabase
                .from("game")
                .select("abb, custom, name")
                .in("abb", abbs)
                .order("custom")
                .order("release_date")
                .order("name");    

            // error handling
            if (error) {
                throw error;
            }

            return games;

        } catch (error) {
            // error should be handled by caller function
            throw error;
        };
    };

    return { queryGame, queryGamesForModerators, searchForGames, queryGameByList };
};

/* ===== EXPORTS ===== */
export default GameRead;