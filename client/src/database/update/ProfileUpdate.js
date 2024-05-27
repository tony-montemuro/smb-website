/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const ProfileUpdate = () => {
    // FUNCTION 1: upsertUserInfo - takes user information, and upserts it to the profile table in the db
    // PRECONDITIONS (1 parameter):
    // 1.) userInfo: an object that contains information about the user. this object must be well-formatted according to
    // the profile table in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if successful, this function will simply return
    // if failure, this function will throw an error, which will be handled in the caller function
    const upsertUserInfo = async userInfo => {
        try {
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

    // FUNCTION 2: insertUserInfo - takes user information, and inserts it to the profile table in the db. THIS FUNCTION SHOULD
    // ONLY EVER BE CALLED BY ADMINS!
    // PRECONDITIONS (1 parameter):
    // 1.) userInfo: an object that contains information about the user. this object must be well-formatted according to
    // the profile table in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if successful, this function will simply return
    // if failure, this function will throw an error, which will be handled in the caller function
    const insertUserInfo = async userInfo => {
        try {
            let { error } = await supabase
                .from("profile")
                .insert(userInfo);

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            throw error;
        }
    }

    return { upsertUserInfo, insertUserInfo };
};

/* ===== EXPORTS ===== */
export default ProfileUpdate;