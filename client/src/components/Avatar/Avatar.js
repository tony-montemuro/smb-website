/* ===== IMPORTS ===== */
import { useState } from "react";
import Download from "../../database/storage/Download";

const Avatar = () => {
    /* ===== STATES ===== */
    const [avatar, setAvatar] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // function for fetching avatar
    const { retrieveImage } = Download();

    // FUNCTION 1: fetchAvatar - function that will return an image given a file name and imageReducer
    // PRECONDITIONS (2 parameters):
    // 1.) fileName: an integer representing a user's uniquer profile ID
    // 2.) imageReducer: an object with two fields:
        // a.) reducer: the image reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (1 possible outcome):
    // the URL of an image is returned, and this url will become the avatar state by calling the setAvatar() function
    const fetchAvatar = async (profileId, imageReducer) => {
        const url = await retrieveImage(profileId, imageReducer, "avatar");
        setAvatar(url);
    };

    return { avatar, fetchAvatar };
};

/* ===== EXPORTS ===== */
export default Avatar;