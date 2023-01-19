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
    };

    // function that, given an image, imageReducer, and type, returns an image. this image may either be from
    // the imageReducer cache, or may need to be downloaded from storage
    const retrieveImage = async (imageName, imageReducer, type) => {
        const images = imageReducer.reducer;
        let img = null;
        if (images && imageName in images) {
            img = images[imageName];
        } else {
            img = type === "avatar" ? await downloadAvatar(imageName) : await downloadBoxArt(imageName);
            imageReducer.dispatchImages({ field: imageName, data: img });
        }
        return img;
    };

    return { downloadAvatar, retrieveImage };
};

export default Download;