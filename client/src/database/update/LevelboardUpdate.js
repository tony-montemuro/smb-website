import { supabase } from "../SupabaseClient";

const LevelboardUpdate = () => {
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
            if (notification.notif_type !== "approve") {
                console.log(error);
                alert(error.message);
            } else {
                throw error;
            }
        }
    };

    // function that takes a submission, and upserts it into the {type} submissions database
    const submit = async (type, submission) => {
        try {
			const { error } = await supabase
				.from(`${type}_submission`)
				.upsert(submission, {
                    returning: "minimal", // Don't return the value after inserting
                }, { 
                    onConflict: "user_id, game_id, level_id"
                });
				
				// error handling
				if (error) {
					throw error;
				}

		} catch(error) {
			console.log(error);
            alert(error.message);
		}
    };

    // function that takes submission data and submits it to the all_submission table
    const submitToAll = async (submission) => {
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
    }

    return { submit, submitToAll, insertNotification };
};

export default LevelboardUpdate;