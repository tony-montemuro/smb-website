import { supabase } from "../SupabaseClient";

const LevelboardUpdate = () => {
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

                // once the submission has completed, we want to reload the page
                window.location.reload();

		} catch(error) {
			console.log(error);
            alert(error.message);
		}
    };

    return { submit };
};

export default LevelboardUpdate;