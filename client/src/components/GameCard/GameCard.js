/* ===== IMPORTS ===== */
import { useState } from "react";
import Download from "../../database/storage/Download";

const GameCard = () => {
    /* ===== STATES ===== */
    const [img, setImg] = useState(null);

    /* ===== FUNCTIONS ===== */

    // function for fetching box art
    const { retrieveImage } = Download();
    
    // FUNCTION 1: fetchBoxArt - retrieve a boxart image
    // PRECONDITINOS (2 parameters):
    // 1.) abb: a string value that represents a game
    // 2.) imageReducer: an object with two fields:
        // a.) reducer: the image reducer itself (state)
        // b.) dispatchImages: the reducer function used to update the reducer
    // POSTCONDITION:
    // the async retrieveImages function is called, with the "boxart" parameter passed to specify that it's a box art.
    // once the function returns the blob, the setImg() function must be called to update the img state
    const fetchBoxArt = async (abb, imageReducer) => {
        const blob = await retrieveImage(abb, imageReducer, "boxart");
        setImg(blob);
    };

    return { img, fetchBoxArt };
};

/* ===== EXPORTS ===== */
export default GameCard;