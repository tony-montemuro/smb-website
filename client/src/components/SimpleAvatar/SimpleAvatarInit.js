import { useState } from "react";
import Download from "../../database/storage/Download";

const SimpleAvatarInit = () => {
    /* ===== STATES ===== */
    const [avatarUrl, setAvatarUrl] = useState(null);

    /* ===== FUNCTIONS ===== */

    // function for fetching avatar
    const { retrieveImage } = Download();

    // function that will return an image from a file name
    const fetchAvatar = async (fileName, imageReducer) => {
        const blob = await retrieveImage(fileName, imageReducer, "avatar");
        setAvatarUrl(blob);
    };

    return { avatarUrl, fetchAvatar };
};

export default SimpleAvatarInit;