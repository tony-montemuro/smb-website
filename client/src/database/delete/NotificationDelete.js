/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const NotificationDelete = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: deleteNotification - function that makes a delete call to the notification table in the database based on notif_date
    // PRECONDITIONS (1 parameter):
    // 1.) notif_date: a string value, corresponding to a notif_date in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is a success, the notification with the matching notif_date field is removed from the notification table
    // if the query fails, this function throws an error to the caller function, where it is handled
    const deleteNotification = async (notif_date) => {
        try {
            const { error } = await supabase
                .from("notification")
                .delete()
                .match({ notif_date: notif_date });

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    return { deleteNotification };
};

/* ===== EXPORTS ===== */
export default NotificationDelete;