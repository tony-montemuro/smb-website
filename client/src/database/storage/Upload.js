/* ===== IMPORTS ====== */
import { supabase } from "../SupabaseClient";
import ProfilesUpdate from "../update/ProfilesUpdate";

const Upload = () => {
    /* ===== FUNCTIONS ===== */

    // database functions
    const { upsertUserInfo } = ProfilesUpdate();

    // FUNCTION 1: uploadAvatar: takes a file and filePath, and uploads (and upserts) into the database storage
    // PRECONDITIONS (2 parameters):
    // 1.) file: an avatar image uploaded by the user. it should have been validated before calling this function
    // 2.) filePath: the filename the avatar should take in the database storage. this is typically the user's id, followed by
    // the png, jpg, or jpeg file extensions
    // POSTCONDITIONS (2 possible outcomes):
    // if successful, this function will make a call to upsertUserInfo, since we also need to update the avatar_url field in profiles table
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

    return { uploadAvatar };
};

/* ===== EXPORTS ===== */
export default Upload;