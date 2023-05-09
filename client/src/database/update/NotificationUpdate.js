/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const NotificationUpdate = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: insertNotification - takes a notification object, and inserts it into the notification table
    // PRECONDITIONS (1 parameter):
    // 1.) notification: a notification object, which contains many of the fields required by the notification table in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, this function simply returns
    // if not, the function will either handle the error in this function, or the caller function, depending on the notif_type field
    const insertNotification = async (notification) => {
        try {
            const { error } = await supabase
                .from("notification")
                .insert(notification, { returning: 'minimal' });

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // delete & update will be error in caller function. approvals & inserts are handled here
            // in a higher-up function
            if (notification.notif_type === "approve" || notification.notif_type === "insert") {
                console.log(error);
                alert(error.message);
            } else {
                throw error;
            }
        }
    };

    return { insertNotification };
};

/* ===== EXPORTS ===== */
export default NotificationUpdate;