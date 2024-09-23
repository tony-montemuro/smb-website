/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const Download = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: downloadBoxArt - function that takes the abb string parameter, and uses it to download box art for abb's game
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string value, representing a game's abb value. in this context, we can use it to retrieve that game's box art
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, we convert the blob object returned into a url object, and return it
    // if the query is unsuccessful, simply return null
    const downloadBoxArt = async (abb) => {
        try {
            // query supabase games storage for the image
            const { data, error } = await supabase.storage.from("games").download(`${ abb }.png`);

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

    // FUNCTION 2: downloadAvatar - function that takes the name of an avatar file, downloads it, and returns it
    // PRECONDITIONS (1 parameter):
    // 1.) path: a string that represents the name of a file in the avatar storage bucket
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, we convert the blob object returned into a url object, and return it
    // if the query is unsuccessful, simply return null
    const downloadAvatar = async path => {
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

    // FUNCTION 3: retrieveGameImage - public facing function that, given an image & imageReducer, and type, returns a game image. this 
    // image may either be from the imageReducer cache, or may need to be downloaded from storage
    // PRECONDITIONS (2 parameters):
    // 1.) abb: a string that represents the name of a file in one of the storage bucket (game abb)
    // 2.) imageReducer: an object with two fields:
        // a.) reducer: the image reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (2 possible outcomes):
    // if imageName is already stored in cache, we can retrieve the URL object from there, and return it
    // otherwise, we need to make a query to the database (different query depending on the type parameter), and
    // update the cache once the query is complete
    const retrieveGameImage = async (imageName, imageReducer) => {
        const images = imageReducer.reducer.games;
        let img = null;
        if (imageName in images) {
            img = images[imageName];
        } else {
            img = await downloadBoxArt(imageName);
            imageReducer.dispatchImages({ set: "games", field: imageName, data: img });
        }
        return img;
    };

    // FUNCTION 4: updateImageByProfileId - public facing function that, given an image, imageReducer, and forceUpdate boolean, will update
    // the imageReducer global images state, if necessary (imageName is not found in imageReducer, or forceUpdate is set to true)
    // PRECONDITIONS (3 parameters):
    // 1.) imageName: a string that represents the name of a file in one of the storage bucket
    // 2.) imageReducer: an object with two fields:
        // a.) reducer: the image reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // 3.) forceUpdate: a boolean value, which will determine if update should be forced or not
    // POSTCONDITIONS (2 possible outcomes):
    // if the imageReducer requires an update, or forceUpdate is set to true, we will download the avatar from storage, and
    // update the imageReducer state
    // otherwise, this function does nothing
    const updateImageByProfileId = async (profileId, imageReducer, forceUpdate) => {
        const images = imageReducer.reducer.users;
        const imageName = `${ profileId }.png`;
        if (!(imageName in images) || forceUpdate) {
            const img = await downloadAvatar(imageName);
            imageReducer.dispatchImages({ set: "users", field: imageName, data: img });
        }
    };

    // FUNCTION 4: updateImageByAbb - public facing function that, given an image, imageReducer, and forceUpdate boolean, will update
    // the imageReducer global images state, if necessary (imageName is not found in imageReducer, or forceUpdate is set to true)
    // PRECONDITIONS (3 parameters):
    // 1.) imageName: a string that represents the name of a file in one of the storage bucket
    // 2.) imageReducer: an object with two fields:
        // a.) reducer: the image reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // 3.) forceUpdate: a boolean value, which will determine if update should be forced or not
    // POSTCONDITIONS (2 possible outcomes):
    // if the imageReducer requires an update, or forceUpdate is set to true, we will download the box art from storage, and
    // update the imageReducer state
    // otherwise, this function does nothing
    const updateImageByAbb = async (abb, imageReducer, forceUpdate) => {
        const images = imageReducer.reducer.games;
        if (!(abb in images) || forceUpdate) {
            const img = await downloadBoxArt(abb);
            imageReducer.dispatchImages({ set: "games", field: abb, data: img });
        }
    };

    return { retrieveGameImage, updateImageByProfileId, updateImageByAbb };
};

/* ===== EXPORTS ===== */
export default Download;