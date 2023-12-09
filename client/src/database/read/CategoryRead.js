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

    return { queryCategories };
};

/* ===== EXPORTS ===== */
export default CategoryRead;