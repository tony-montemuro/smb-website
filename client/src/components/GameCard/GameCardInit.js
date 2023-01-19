import { useState } from "react";
import Download from "../../database/storage/Download";

const GameCardInit = () => {
    /* ===== STATES ===== */
    const [img, setImg] = useState(null);

    /* ===== FUNCTIONS ===== */

    // function for fetching box art
    const { retrieveImage } = Download();
    
    // function that will return an image from an abbreviation (abb)
    const fetchBoxArt = async (abb, imageState) => {
        // const blob = await downloadBoxArt(abb);
        const blob = await retrieveImage(abb, imageState, "boxart");
        setImg(blob);
    };

    return { img, fetchBoxArt };
};

export default GameCardInit;