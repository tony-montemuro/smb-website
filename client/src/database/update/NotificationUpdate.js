/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const NotificationUpdate = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: insertNotification - takes a notification object, and inserts it into the notification table
    // PRECONDITIONS (1 parameter):
    // 1.) notification: a notification object, which contains many of the fields required by the notification table in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, this function simply returns
    // if not, the function will either handle the error in the caller function
    const insertNotification = async (notification) => {
        try {
            const { error } = await supabase
                .from("notification")
                .insert(notification);

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // special case: notification attempted to be sent to an unauthenticated user. this is actually expected behavior,
            // so do not throw an error; just return
            if (error.code === "42501" && error.message === 'new row violates row-level security policy "Enforce receiving profile exists [RESTRICTIVE]" for table "notification"') {
                return;
            }

            // general case: error is handled by caller function
            else {
                throw error;
            }
        }
    };

    return { insertNotification };
};

/* ===== EXPORTS ===== */
export default NotificationUpdate;