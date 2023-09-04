/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const ReportDelete = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: deleteReport - function that makes a delete call to the report table in the database based on the report_date
    // attribute
    // PRECONDITIONS (1 parameter):
    // 1.) report_date: a string, representing the primary key of a report, in the timestamptz PostgreSQL format
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the report with the matching report_date is removed, and the function simply returns
    // if the query is unsuccessful, the function will throw an error, which should be handled by the caller function
    const deleteReport = async report_date => {
        try {
            const { error } = await supabase
                .from("report")
                .delete()
                .match({ report_date: report_date });

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // error to be handled by the caller function
            return error;
        }
    };

    return { deleteReport };
};

/* ===== EXPORTS ===== */
export default ReportDelete;