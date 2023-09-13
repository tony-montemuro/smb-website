/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const NotificationRead = () => {
    /* ===== FUNCTIONS ===== */
    
    // FUNCTION 1: queryNotificationCount - async function that makes a call to supabase to get the total number of notifications
    // for the given user
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, an integer will be returned that has the count of all notifications for the current user
    // otherwise, this function will throw an error, which is expected to be handled by the caller function
    const queryNotificationCount = async () => {
        try { 
            const { count, error } = await supabase
                .from("notification")
                .select("*", { count: "exact", head: true });

            // error handling
            if (error) {
                throw error;
            }

            return count;

        } catch (error) {
            // error is expected to be handled by caller function
            throw error;
        };
    };

    // FUNCTION 2: queryNotifications - async function that makes a call to supabase to get a range of notifications for
    // a given user
    // PRECONDITIONS (2 parameters):
    // 1.) start: an integer, representing the first notification to be selected
    // 2.) end: an integer, representing last notification to be selected
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of notifications is simply returned
    // otherwise, an error is thrown to be handled by the caller function
    const queryNotifications = async (start, end) => {
        try {
            const { data: notificationsList, count, error } = await supabase
                .from("notification")
                .select(`
                    notif_date,
                    notif_type,
                    creator:profile!notification_creator_id_fkey (country, id, username),
                    message,
                    submission (
                        profile (id, username),
                        record,
                        region (id, region_name),
                        submitted_at,
                        monkey (id, monkey_name),
                        platform (id, platform_name),
                        proof,
                        comment,
                        live,
                        position,
                        all_position,
                        tas
                    ),
                    level (
                        category, 
                        mode (
                            game (
                                abb, name
                            )
                        ), 
                        name,
                        timer_type
                    ),
                    score,
                    record,
                    submitted_at,
                    region (id, region_name),
                    monkey (id, monkey_name),
                    platform (id, platform_name),
                    proof,
                    live,
                    comment,
                    tas
                `,
                { count: "exact" })
                .order("notif_date", { ascending: false })
                .range(start, end);

            // error handling
            if (error) {
                throw error;
            }

            // if we made it this far, return notifications, as well as count
            return { notificationsList, count };

        } catch (error) {
            // handle error in caller function
            throw error;
        }
    };

    return { queryNotificationCount, queryNotifications };
};

/* ===== EXPORTS ===== */
export default NotificationRead;