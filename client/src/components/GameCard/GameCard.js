/* ===== IMPORTS ===== */
import { useState } from "react";
import Download from "../../database/storage/Download";

const GameCard = () => {
    /* ===== STATES ===== */
    const [img, setImg] = useState(null);

    /* ===== FUNCTIONS ===== */

    // function for fetching box art
    const { retrieveImage } = Download();
    
    // function that will return an image from an abbreviation (abb)
    const fetchBoxArt = async (abb, imageReducer) => {
        const blob = await retrieveImage(abb, imageReducer, "boxart");
        setImg(blob);
    };

    return { img, fetchBoxArt };
};

export default GameCard;