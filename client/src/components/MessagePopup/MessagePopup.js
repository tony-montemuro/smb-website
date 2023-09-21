/* ===== IMPORTS ===== */
import { useState } from "react";

const MessagePopup = () => {
    /* ===== VARIABLES ===== */
    const initMessage = { val: null, type: null };

    /* ===== STATES ===== */
    const [message, setMessage] = useState(initMessage);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: addMessage - function that takes a message, and it's type, and sets the message state
    // PRECONDITIONS (2 parameters):
    // 1.) message: a string value containing the message to be rendered to the client
    // 2.) type: a string value specifying the type of message, which has impacts on styling. either "error" or "success"
    // POSTCONDITIONS (1 possible outcome):
    // a new object is greated using the two parameters, and the object is set as the new message
    const addMessage = (message, type) => {
        setMessage({ val: message, type });
    };

    // FUNCTION 2: handleMessageClose - function that is executed when the user closes a message popup
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the message popup is closed
    const handleMessageClose = () => {
        setMessage(initMessage);
    };

    return { message, addMessage, handleMessageClose };
};

/* ===== EXPORTS ===== */
export default MessagePopup;