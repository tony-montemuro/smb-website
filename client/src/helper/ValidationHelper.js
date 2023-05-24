const ValidationHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: validateEmail - determine if email is valid
    // PRECONDITIONS (1 parameter):
    // 1.) email: a string that represents an email
    // POSTCONDITIONS (1 possible outcome, 1 return):
    // 1.) error: a string that gives information as to why their is an issue with the email
    const validateEmail = email => {
        // initialize variables used in validation process
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

        // first, validate that the email exists
        if (!email || email.length === 0) {
            return "Email is required.";
        }

        // next, validate that email is well-formatted
        if (!emailRegex.test(email)) {
            return "Invalid email format.";
        }

        return undefined;
    };
    
    // FUNCTION 2: validateMessage - given a message, and the required flag, validate the message
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

    return { validateEmail, validateMessage };
};

/* ===== EXPORTS ===== */
export default ValidationHelper;