/* ===== IMPORTS ===== */
import { useEffect } from "react";
import AvatarLogic from "./Avatar.js";
import Default from "../../img/default.png";

function Avatar( { profileId, size, imageReducer } ) {
    /* ===== FUNCTIONS ===== */

    // states and functions from the js file file
    const { avatar, fetchAvatar } = AvatarLogic();

    /* ===== EFFECTS ===== */

    // code that is executed when the component mounts
    useEffect(() => {
        fetchAvatar(profileId, imageReducer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

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