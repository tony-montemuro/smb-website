/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const GameRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryGames - async function that makes a call to supabase to get an array of all the games
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of games is simply returned
    // otherwise, the user is alerted of the error, and an empty array is returned
    const queryGames = async () => {
        try {
            const { data: games, error, status } = await supabase
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
            return games;

        } catch (error) {
            console.log(error);
            alert(error.message);
            return [];
        }
    };

    return { queryGames };
};

/* ===== EXPORTS ===== */
export default GameRead;