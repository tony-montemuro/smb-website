/* ===== IMPORTS ===== */
import { useState } from "react";

const MessagePopup = () => {
    /* ===== STATES ===== */
    const [messages, setMessages] = useState([]);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: addMessage - function that takes a message, and it's type, and adds it to the array of messages
    // PRECONDITIONS (2 parameters):
    // 1.) message: a string value containing the message to be rendered to the client
    // 2.) type: a string value specifying the type of message, which has impacts on styling. either "error" or "success"
    // POSTCONDITIONS (1 possible outcome):
    // a new object is greated using the two parameters, and the object is pushed into the messages state array
    const addMessage = (message, type) => {
        setMessages([...messages, { message, type }]);
    };

    // FUNCTION 2: handleMessageClose - function that is executed when the user closes a message popup
    // PRECONDITIONS (1 parameter):
    // 1.) index: the index-th element to be removed from the messages array, causing it to immediately unrender
    // POSTCONDITIONS (1 possible outcome):
    // the message popup is closed
    const handleMessageClose = index => {
        setMessages(messages.filter((_, i) => i !== index));
    };

    return { messages, addMessage, handleMessageClose };
};

/* ===== EXPORTS ===== */
export default MessagePopup;