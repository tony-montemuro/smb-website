/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const ReportUpdate = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: insertReport - function that takes a report object, and inserts it into the db
    // PRECONDITIONS (1 parameter):
    // 1.) report: an object containing the fields relevant to a submission report
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, simply return
    // otherwise, throw the error to be handled in the caller function
    const insertReport = async report => {
        try {
            const { error } = await supabase
                .from("report2")
                .insert(report);
    
            // error handling
            if (error) {
                throw error;
            }
    
        } catch (error) {
            throw error;
        }
    };
    
    return { insertReport };
};

/* ===== EXPORTS ===== */
export default ReportUpdate;