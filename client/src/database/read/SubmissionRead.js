/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const SubmissionRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: getUnapproved - function that grabs all submissions that have not yet been approved [note: this function does NOT
    // cache submissions]
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes, 1 return):
    // if the query is a success, an array containing all of the unapproved submissions will be returned
    // otherwise, this function will throw an error, which should be handled by the caller function
    const getUnapproved = async () => {
        try {
            const { data: unapproved, error } = await supabase
                .from("submission")
                .select(`
                    details:all_submission (
                        all_position,
                        comment,
                        id,
                        live,
                        monkey (id, monkey_name),
                        platform (id, platform_name),
                        position,
                        proof,
                        record,
                        region (id, region_name),
                        submitted_at
                    ),
                    level (
                        category,
                        mode (
                            game (
                                abb,
                                name
                            )
                        ),
                        name,
                        timer_type
                    ),
                    profile (
                        country,
                        id,
                        username
                    ),
                    report (
                        creator:profile (
                            country,
                            id,
                            username
                        ),
                        message,
                        profile_id,
                        report_date
                    ),
                    score,
                    approved
                `)
                .eq("approved", false);

            // error handling
            if (error) {
                throw error;
            }

            // return the array of unapproved submissions
            return unapproved;

        } catch (error) {
            // error will be handled by caller function
            throw error;
        }
    };

    return { getUnapproved };
};

/* ===== EXPORTS ===== */
export default SubmissionRead;