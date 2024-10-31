/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const CategoryRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryCategories - async function that makes a call to supabase to get an array of all the categories
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of categories is simply returned
    // otherwise, this function throws an error, which should be handled by caller function
    const queryCategories = async () => {
        try {
            const { data: categories, error } = await supabase
                .from("category")
                .select("abb, name, practice, id")
                .order("id");

            // error handling
            if (error) {
                throw error;
            }

            // return data
            return categories;

        } catch (error) {
            // throw error to be handled by callers
            throw error;
        };
    };

    // FUNCITON 2: queryStructureByGame - code that is executed to grab all levels based on game (abb), organized by category
    // & mode
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string representing the unique identifier for a game
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of levels associated with a game, organized by category + mode, is returned
    // if the query is unsuccessful, the function throws an error, which should be handled by the caller function
    const queryStructureByGame = async abb => {
        try {
            const { data: categories, error } = await supabase
                .from("category")
                .select(`
                    name,
                    mode!inner (
                        name,
                        level!inner (
                            name
                        )
                    )
                `)
                .eq("mode.game", abb)
                .order("id", { foreignTable: "mode" })
                .order("id", { foreignTable: "mode.level" });

            // error handling
            if (error) {
                throw error;
            }

            return categories;
        } catch (error) {
            // error should be handled by caller function
            throw error;
        }
    };

    return { queryCategories, queryStructureByGame };
};

/* ===== EXPORTS ===== */
export default CategoryRead;