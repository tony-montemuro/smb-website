/* ===== IMPORTS ===== */
import { useState } from "react";
import Download from "../../database/storage/Download";

const BoxArt = () => {
    /* ===== STATES ===== */
    const [box, setBox] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { retrieveImage } = Download();
    
    // FUNCTION 1: fetchBoxArt - given an abb and imageReducer, get the game's box art
    // PRECONDITIONS (2 parameters):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // 2.) imageReducer: an object with two fields:
        // a.) reducer: the image reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (1 possible outcome):
    // the boxart is fetched from the database, and the box state is updated by calling the setBox() function
    const fetchBoxArt = async (abb, imageReducer) => {
        const boxArt = await retrieveImage(abb, imageReducer, "boxart");
        setBox(boxArt);
    };

    return { box, fetchBoxArt };
};

/* ===== EXPORTS ===== */
export default BoxArt;