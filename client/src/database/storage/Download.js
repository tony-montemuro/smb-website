import { supabase } from "../SupabaseClient";

const Download = () => {
    // function that takes the abb string parameter, and uses it to download box art for abb's game
    const downloadBoxArt = async (abb) => {
        try {
            // query supabase games storage for the image
            const { data, error } = await supabase.storage.from('games').download(`${ abb }.png`);

            // error handling
            if (error) {
                throw error;
            }

            // return a url object
            return URL.createObjectURL(data);
        } catch (error) {
            console.log(error);
            alert(error.message);
            return null;
        }
    };

    // function that takes the name of an avatar file, downloads it, and returns it
    const downloadAvatar = async (path) => {
        try {
            // query supabase avatar storage for image
            const { data, error } = await supabase.storage.from('avatars').download(path);

            // error handling
            if (error) {
                throw error;
            }

            // return a url object
            return URL.createObjectURL(data);

        } catch (error) {
            console.log(error);
            alert(error.message);
            return null;
        }
    }

    return { downloadBoxArt, downloadAvatar };
};

export default Download;