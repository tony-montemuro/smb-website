import { useState } from "react";
import Download from "../../database/storage/Download";

const SimpleAvatarInit = () => {
    /* ===== STATES ===== */
    const [avatarUrl, setAvatarUrl] = useState(null);

    /* ===== FUNCTIONS ===== */

    // function for fetching avatar
    const { downloadAvatar } = Download();

    // function that will return an image from a file name
    const fetchAvatar = async (fileName) => {
        const blob = await downloadAvatar(fileName);
        setAvatarUrl(blob);
    }

    return { avatarUrl, fetchAvatar };
};

export default SimpleAvatarInit;