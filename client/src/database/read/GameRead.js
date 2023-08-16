/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const GameRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryGames - async function that makes a call to supabase to get an array of all the games
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of games is simply returned
    // otherwise, this function throws an error, which should be handled by caller function
    const queryGames = async () => {
        try {
            const { data: games, error, status } = await supabase
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
                    live_preference,
                    mode (
                        level (
                            category,
                            chart_type,
                            name,
                            time
                        ),
                        category,
                        name
                    ),
                    name,
                    release_date
                `)
                .order("custom")
                .order("id")
                .order("id", { foreignTable: "mode", ascending: true })
                .order("id", { foreignTable: "mode.level", ascending: true });

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return the games
            return games;

        } catch (error) {
            // throw error to be handled by caller
            throw error;
        }
    };

    return { queryGames };
};

/* ===== EXPORTS ===== */
export default GameRead;