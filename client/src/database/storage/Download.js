/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const Download = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: downloadBoxArt - function that takes the abb string parameter, and uses it to download box art for abb's game
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string value, representing a game's abb value. in this context, we can use it to retrieve that game's box art
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, we convert the blob object returned into a url object, and return it
    // if the query is unsuccessful, we alert the user of the error, and return null
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

    // FUNCTION 2: downloadAvatar - function that takes the name of an avatar file, downloads it, and returns it
    // PRECONDITIONS (1 parameter):
    // 1.) path: a string that represents the name of a file in the avatar storage bucket
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, we convert the blob object returned into a url object, and return it
    // if the query is unsuccessful, simply return null
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
            return null;
        }
    };

    // FUNCTION 3: retrieveImage - public facing function that, given an image, imageReducer, and type, returns an image. this image may
    // either be from the imageReducer cache, or may need to be downloaded from storage
    // PRECONDITIONS (3 parameters):
    // 1.) imageName: a string that represents the name of a file in one of the storage bucket
    // 2.) imageReducer: an object with two fields:
        // a.) reducer: the image reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // 3.) type: a string value, either "avatar" or "boxart"
    // POSTCONDITIONS (2 possible outcomes):
    // if imageName is already stored in cache, we can retrieve the URL object from there, and return it
    // otherwise, we need to make a query to the database (different query depending on the type parameter), and
    // update the cache once the query is complete
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

    return { retrieveImage };
};

/* ===== EXPORTS ===== */
export default Download;