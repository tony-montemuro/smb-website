/* ===== IMPORTS ===== */
import { emailPattern } from "../utils/RegexPatterns";
import { twitterPatttern, twitchPattern, youtubePattern } from "../utils/RegexPatterns";

const ValidationHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: validateEmail - determine if email is valid
    // PRECONDITIONS (1 parameter):
    // 1.) email: a string that represents an email
    // POSTCONDITIONS (1 possible outcome, 1 return):
    // 1.) error: a string that gives information as to why their is an issue with the email
    const validateEmail = email => {
        // first, validate that the email exists
        if (!email || email.length === 0) {
            return "Email is required.";
        }

        // next, validate that email is well-formatted
        if (!emailPattern.test(email)) {
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

    // FUNCTION 3: validateProof - given a proof string, validate the proof
    // PRECONDITIONS (1 parameter):
    // 1.) proof: a string value representing the proof of the submission
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the proof is determined to be invalid, return a string that contains the error message
    // if the proof is determined to be valid, return undefined
    const validateProof = proof => {
        // check if the proof field is non-null
        if (!proof) {
            return "Proof is required.";
        }

        // check if proof is a valid youtube, twitch, or twitter url
        if (!twitchPattern.test(proof) && !youtubePattern.test(proof) && !twitterPatttern.test(proof)) {
            return "Proof must be a valid YouTube or Twitch URL.";
        }

        // if we made it this far, the comment is valid! return undefined, since there is no error
        return undefined;
    };

    // FUNCTION 4: validateComment - given a comment string, validate the comment
    // PRECONDITIONS (1 parameter):
    // 1.) comment: a string value representing the comment of the submission
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the comment is determined to be invalid, return a string that contains the error message
    // if the comment is determined to be valid, return undefined
    const validateComment = comment => {
        // check if the comment is greater than 100 characters long
        if (comment.length > 100) {
            return "Comment must be 100 characters or less.";
        }

        // if we made it this far, the comment is valid! return undefined, since there is no error
        return undefined;
    };

    return { validateEmail, validateMessage, validateProof, validateComment };
};

/* ===== EXPORTS ===== */
export default ValidationHelper;