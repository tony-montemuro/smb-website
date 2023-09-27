/* ===== IMPORTS ===== */
import { useState } from "react";

const UserFilterPopup = () => {
    /* ===== STATES ===== */

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: closePopup - code that simply closes the user filter popup
    // PRECONDITIONS (1 parameter):
    // 1.) setPopup: setter function that, when set to null, closes the popup
    // POSTCONDITIONS (1 possible outcome):
    // the popup is closed by calling the `setPopup` function with `false` as an argument
    const closePopup = setPopup => {
        setPopup(false);
    };

    return { closePopup };
};

/* ===== EXPORTS ===== */
export default UserFilterPopup;