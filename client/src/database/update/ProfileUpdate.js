import { supabase } from "../SupabaseClient";

const ProfileUpdate = () => {
    // FUNCTION 1: upsertUserInfo: takes user information, and upserts it to the profiles page
    // PRECONDITIONS (1 parameter):
    // 1.) userInfo: an object that contains information about the user. this object must be well-formatted according to
    // the profiles page in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if successful, this function will simply return
    // if failure, this function will throw an error, which will be handled in the caller function
    const upsertUserInfo = async (userInfo) => {
        try {
            userInfo.country = userInfo.country === "" ? null : userInfo.country;
            let { error } = await supabase
                .from('profiles')
                .upsert(userInfo, {
                    returning: "minimal", // Don't return the value after inserting
                }
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

    // FUNCTION 2: uploadAvatar: takes a file and filePath, and uploads (and upserts) into the database storage
    // PRECONDITIONS (2 parameters):
    // 1.) file: an avatar image uploaded by the user. it should have been validated before calling this function
    // 2.) filePath: the filename the avatar should take in the database storage. this is typically the user's id, followed by
    // the png, jpg, or jpeg file extensions
    // POSTCONDITIONS (2 possible outcomes):
    // if successful, this function will make a call to upsertUserInfo, since we also need to update the avatar_url field in profiles
    // if failure, this function will throw an error, which will be handled in the caller function
    const uploadAvatar = async (file, filePath) => {
        try {
            // first, upload avatar to storage bucket
            let { error } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, {
                    upsert: true
                });

            // error handling
            if (error) {
                throw error;
            }

            // if we made it this far, this means the avatar successfully updated. now, lets call the
            // userInfo function to update the profiles page
            const userId = filePath.split(".")[0];
            await upsertUserInfo({ id: userId, avatar_url: filePath });

        } catch (error) {
            // error will be handled in a higher-up function
            throw error;
        }
    };

    return { upsertUserInfo, uploadAvatar };
};

/* ===== EXPORTS ===== */
export default ProfileUpdate;