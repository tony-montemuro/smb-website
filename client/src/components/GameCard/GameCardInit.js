import { useState } from "react";
import Download from "../../database/storage/Download";

const GameCardInit = () => {
    /* ===== STATES ===== */
    const [img, setImg] = useState(null);

    /* ===== FUNCTIONS ===== */

    // function for fetching box art
    const { downloadBoxArt } = Download();
    
    // function that will return an image from an abbreviation (abb)
    const fetchBoxArt = async (abb) => {
        const blob = await downloadBoxArt(abb);
        setImg(blob);
    };

    return { img, fetchBoxArt };
};

export default GameCardInit;