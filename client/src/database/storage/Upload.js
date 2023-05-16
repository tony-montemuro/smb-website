/* ===== IMPORTS ====== */
import { supabase } from "../SupabaseClient";

const Upload = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: uploadAvatar: takes a file and filePath, and uploads (and upserts) into the database storage
    // PRECONDITIONS (2 parameters):
    // 1.) file: an avatar image uploaded by the user. it should have been validated before calling this function
    // 2.) filePath: the filename the avatar should take in the database storage. this is typically the user's id, followed by
    // the png, jpg, or jpeg file extensions
    // POSTCONDITIONS (2 possible outcomes):
    // if successful, this function will simply return
    // if failure, this function will throw an error, which will be handled in the caller function
    const uploadAvatar = async (file, filePath) => {
        try {
            // first, upload avatar to storage bucket
            let { error } = await supabase.storage
                .from("avatars")
                .upload(filePath.toString(), file, {
                    upsert: true
                });

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // error will be handled in a higher-up function
            throw error;
        }
    };

    return { uploadAvatar };
};

/* ===== EXPORTS ===== */
export default Upload;