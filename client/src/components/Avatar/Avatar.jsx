/* ===== IMPORTS ===== */
import { useEffect, useState } from "react";
import Default from "../../assets/png/default.png";
import Download from "../../database/storage/Download";

function Avatar( { profileId, size, imageReducer } ) {
    /* ===== VARIABLES ===== */
    const images = imageReducer.reducer;

    /* ===== FUNCTIONS ===== */

    // database functions
    const { updateImageByProfileId } = Download();

    /* ===== STATES ===== */
    const [avatar, setAvatar] = useState(undefined);

    /* ===== EFFECTS ===== */

    // code that is executed when the component mounts, or when the `profileId` parameter is changed
    useEffect(() => {
        updateImageByProfileId(profileId, imageReducer, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId]);

    // code that is executed when the component mounts, or when the image associated with `profileId` is updated
    useEffect(() => {
        setAvatar(images.users[`${ profileId }.png`]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [images.users[`${ profileId }.png`]]);

    /* ===== AVATAR COMPONENT ===== */

    // General case: avatar is either a valid URL, or undefined. If undefined, this means we are still loading the image. Otherwise,
    // we will simply render the image.
    return avatar !== null ?
        <img
            src={ avatar ? avatar : null }
            alt={ avatar ? `${ profileId }` : "" }
            style={ { height: size, width: size } }
        > 
        </img>
    :
        // Special case: avatar is null. This means the user has no profile picture. Thus, we will render the default picture instead.
        <img
            src={ Default }
            alt={ `${ profileId }` }
            style={ { height: size, width: size } }
        >
        </img>
};

/* ===== EXPORTS ===== */
export default Avatar;