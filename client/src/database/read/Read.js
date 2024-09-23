// This is a unique "read" file, as it has no tie to a particular DB table. It is intended for generic read queries.

/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const Read = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryAll - async function that makes a call to supabase to get an array of all the entities
    // PRECONDTIONS (3 parameters):
    // 1.) tableName: a string, representing the name of a table in the database, which we wish to call
    // 2.) orderBy: an optional string parameter that specifices which column the data should be sorted on
    // 3.) isAscending: an optional boolean parameter. if true, order ascending. otherwise, descending. this
    // parameter should only be set when 'orderBy' is set. true by default
    // POSTCONDTIONS (2 possible outcomes):
    // if the query is successful, the list of monkeys is simply returned
    // otherwise, this function throws an error, which should be handled by caller function
    const queryAll = async (tableName, orderBy = null, isAscending = true) => {
        try {
            // construct query according to parameters
            const query = supabase.from(tableName).select("*");
            if (orderBy) {
                query.order(orderBy, { ascending: isAscending });
            }

            const { data: rows, error } = await query;

            // error handling
            if (error) {
                throw error;
            }

            // return data
            return rows;

        } catch(error) {
            // throw error to be handled by caller
            throw error;
        }
    };

    return { queryAll };
};

/* ===== EXPORTS ===== */
export default Read;