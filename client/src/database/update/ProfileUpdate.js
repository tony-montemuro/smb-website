import { supabase } from "../SupabaseClient";

const ProfileUpdate = () => {
    // function that takes user information, and upserts it to the profiles page
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

            // if successful, reload the page
            window.location.reload();

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    // function that takes an avatar, uploads it, and updates the user's profile
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

        } catch (error) {
            // if this fails, we want to end the upload process and return early
            console.log(error);
            alert(error);
            return;
        }

        // if we made it this far, this means the avatar successfully updated. now, lets call the
        // userInfo function to update the profiles page
        const userId = filePath.split(".")[0];
        await upsertUserInfo({ id: userId, avatar_url: filePath });
    }

    return { upsertUserInfo, uploadAvatar };
};

export default ProfileUpdate;