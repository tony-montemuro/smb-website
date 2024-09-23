// This is a unique "update" file, as it has no tie to a particular DB table. It is intended for generic write queries.

/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const Update = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: insert - function that, given an table name and object, inserts that object to the database
    // PRECONDITIONS (2 parameters):
    // 1.) tableName: the name of the table we want to insert item into 
    // 2.) obj: the object, which contains all the necessary elements of the table, we wish to insert
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the object is added to the database, and the function simply returns
    // if the query is unsuccessful, the function throws an error, which should be handled by the caller function
    const insert = async (tableName, obj) => {
        try {
            const { error } = await supabase
                .from(tableName)
                .insert(obj);

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // simply throw error, which should be handled by caller function
            throw error;
        }
    };

    return { insert };
};

/* ===== EXPORTS ===== */
export default Update;