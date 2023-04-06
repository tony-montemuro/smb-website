const ValidationHelper = () => {
    /* ===== FUNCTIONS ===== */
    
    // FUNCTION 1: validateMessage - given a message, and the required flag, validate the message
    // PRECONDITIONS (2 parameters):
    // 1.) message: a string value representing the message of the submission
    // 2.) required: a boolean flag. if true, the function will require that message be a non-empty string. otherwise,
    // the function will accept an empty message
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the comment is determined to be invalid, return a string that contains the error message
    // if the comment is determined to be valid, return undefined
    const validateMessage = (message, required) => {
        // first, if the message is required, and is empty, return an error
        if (required && message.length === 0) {
            return "Message is required!";
        }

        // check if the message is greater than 100 characters long
        if (message.length > 100) {
            return "Message must be 100 characters or less.";
        }

        // if we made it this far, the comment is valid! return undefined, since there is no error
        return undefined;
    };

    return { validateMessage };
};

/* ===== EXPORTS ===== */
export default ValidationHelper;