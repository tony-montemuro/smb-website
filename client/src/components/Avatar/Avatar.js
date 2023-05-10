/* ===== IMPORTS ===== */
import { useState } from "react";
import Download from "../../database/storage/Download";

const Avatar = () => {
    /* ===== STATES ===== */
    const [avatarUrl, setAvatarUrl] = useState(null);

    /* ===== FUNCTIONS ===== */

    // function for fetching avatar
    const { retrieveImage } = Download();

    // FUNCTION 1: fetchAvatar - function that will return an image given a file name and imageReducer
    // PRECONDITIONS (2 parameters):
    // 1.) fileName: a string representing the name of an avatar. typically has a uuid format with a file extension appended to the end
    // 2.) imageReducer: an object with two fields:
        // a.) reducer: the image reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (1 possible outcome):
    // the URL of an image is returned, and this url will become the avatarUrl state by calling the setAvatarUrl() function
    const fetchAvatar = async (fileName, imageReducer) => {
        const url = await retrieveImage(fileName, imageReducer, "avatar");
        setAvatarUrl(url);
    };

    return { avatarUrl, fetchAvatar };
};

/* ===== EXPORTS ===== */
export default Avatar;