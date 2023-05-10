/* ===== IMPORTS ===== */
import { useEffect } from "react";
import AvatarLogic from "./Avatar.js";

function Avatar( { url, size, imageReducer } ) {
    /* ===== FUNCTIONS ===== */

    // states and functions from the js file file
    const { avatarUrl, fetchAvatar } = AvatarLogic();

    /* ===== EFFECTS ===== */

    // code that is executed when the component mounts
    useEffect(() => {
        fetchAvatar(url, imageReducer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

    /* ===== SIMPLE AVATAR COMPONENT ===== */
    return (
        <img
            src={ avatarUrl && avatarUrl }
            alt={ avatarUrl ? 'Avatar' : 'No image' }
            style={ { height: size, width: size } }> 
        </img>
    );
}

/* ===== EXPORTS ===== */
export default Avatar;