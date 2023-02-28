import { supabase } from "../SupabaseClient";

const LevelboardUpdate = () => {
    // function that takes submission data and submits it to the all_submission table
    const submit = async (submission) => {
        try {
            const { error } = await supabase
                .from("all_submission")
                .insert(submission, {
                    returning: "minimal", // Don't return the value after inserting
                });

            // error handling
            if (error) {
                throw error;
            }
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    // function that takes a notification object, and inserts it into the notification table
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
            // delete, insert, and update will be error handled here. approvals are a special case; they are handled
            // in a higher-up function
            if (notification.notif_type === "approve" || notification.notif_type === "insert") {
                console.log(error);
                alert(error.message);
            } else {
                throw error;
            }
        }
    };

    return { submit, insertNotification };
};

export default LevelboardUpdate;