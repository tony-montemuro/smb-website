/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const NotificationRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryUserNotifications - async function that makes a call to supabase to get an array of all notifications for
    // a given user
    // PRECONDITIONS (1 parameter):
    // 1.) userId - a string corresponding to the uuid of a user, typically the currently signed-in user
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of notifications is simply returned
    // otherwise, the user is alerted of the error, and an empty array is returned
    const queryUserNotifications = async (userId) => {
        try {
            const { data: notificationsList, error, status } = await supabase
                .from("notification")
                .select(`
                    notif_date,
                    notif_type,
                    creator:profiles!notification_creator_id_fkey (id, username),
                    message,
                    submission:all_submission (
                        user:profiles (id, username),
                        record,
                        region (region_name),
                        submitted_at,
                        monkey (monkey_name),
                        proof,
                        comment,
                        live,
                        position,
                        all_position
                    ),
                    level (name, misc, mode (game (abb, name))),
                    score,
                    record
                `)
                .eq("user_id", userId)
                .order("notif_date", { ascending: false });

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return notificationsList;

        } catch (error) {
            console.log(error);
            alert(error.message);
            return [];
        }
    };

    return { queryUserNotifications };
};

/* ===== EXPORTS ===== */
export default NotificationRead;