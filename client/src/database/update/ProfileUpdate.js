import { supabase } from "../../components/SupabaseClient/SupabaseClient";

const ProfileUpdate = () => {
    // function that takes user information, and upserts it to the profiles page
    const upsertInfo = async (userInfo) => {
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
    const uploadAvatar = async (file, filePath, userId) => {
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
        await upsertInfo({ id: userId, avatar_url: filePath });
    }

    return { upsertInfo, uploadAvatar };
};

export default ProfileUpdate;