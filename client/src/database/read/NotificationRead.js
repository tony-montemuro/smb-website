/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const NotificationRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryUserNotifications - async function that makes a call to supabase to get an array of all notifications for
    // a given user
    // PRECONDITIONS (1 condition):
    // this function should only return notifications belonging to the authenticated user. this should be ensured by an RLS policy in the
    // database
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of notifications is simply returned
    // otherwise, an error is thrown to be handled by the caller function
    const queryUserNotifications = async () => {
        try {
            const { data: notificationsList, error, status } = await supabase
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
                `)
                .order("notif_date", { ascending: false });

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return notificationsList;

        } catch (error) {
            // handle error in caller function
            throw error;
        }
    };

    return { queryUserNotifications };
};

/* ===== EXPORTS ===== */
export default NotificationRead;