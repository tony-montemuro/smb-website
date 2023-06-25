/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const ProfilesUpdate = () => {
    // FUNCTION 1: upsertUserInfo: takes user information, and upserts it to the profiles page
    // PRECONDITIONS (1 parameter):
    // 1.) userInfo: an object that contains information about the user. this object must be well-formatted according to
    // the profiles page in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if successful, this function will simply return
    // if failure, this function will throw an error, which will be handled in the caller function
    const upsertUserInfo = async (userInfo) => {
        try {
            console.log(userInfo);
            let { error } = await supabase
                .from("profile")
                .upsert(userInfo,
                    { onConflict: "user_id" }
                );

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // error will be handled in a higher-up function
            throw error;
        }
    };

    return { upsertUserInfo };
};

/* ===== EXPORTS ===== */
export default ProfilesUpdate;