/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const NotificationDelete = () => {
    /* ===== FUNCTIONS ===== */

    // function that makes a delete call to the notification table in the database based on the id
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