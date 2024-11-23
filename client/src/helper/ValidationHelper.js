/* ===== IMPORTS ===== */
import { emailPattern } from "../utils/RegexPatterns";
import { 
    twitterPatttern,
    twitchPattern,
    youtubePattern,
    imgurPattern,
    googleDrivePattern,
    versionPattern
} from "../utils/RegexPatterns";

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

    // FUNCTION 2: validateVideoUrl - given a video url, validate that it's either a youtube, twitch, twitter, google drive, 
    // or imgur video
    // PRECONDITIONS (1 parameter):
    // 1.) url: a string value representing a video url; also may be an empty string
    // POSTCONDITIONS (2 possible outcomes):
    // if the video is determined to be non-valid, return a string that contains the error message
    // if the proof is determined to be valid, return undefined
    const validateVideoUrl = url => {
        if (url && !twitchPattern.test(url) && !youtubePattern.test(url) && !twitterPatttern.test(url) && !imgurPattern.test(url) && !googleDrivePattern.test(url)) {
            return "Not a valid YouTube, Twitch, X (Twitter), Google Drive, or Imgur URL.";
        }
        return undefined;
    };

    // FUNCTION 3: validateDate - given a date string, validate that it's a valid format
    // PRECONDITIONS (1 parameter):
    // 1.) date: a string (or null) representing a data, in a front-end YYYY-MM-DD format
    // POSTCONDITIONS (2 possible outcomes):
    // if the date is determined to be invalid, return a string that contains the error message
    // if the date is determined to be valid, return undefined
    const validateDate = date => {
        if (!date || date.includes("NaN")) {
            return "Please select a valid date.";
        }
        return undefined;
    }

    // FUNCTION 4: validateLive - given the live boolean value, as well as the submission proof, validate `live` field
    // PRECONDITIONS (2 parameter):
    // 1.) live: a boolean value, corresponding to whether or not the user provided a "live" proof
    // 2.) proof: a string containing the users's link to a proof
    // POSTCONDITIONS (2 possible outcomes):
    // if live is determined to be valid based on the proof parameter, return undefined
    // if live is determined to be invalid based on the proof parameter, return a string that contains the error message
    const validateLive = (live, proof) => {
        if (!proof && live) {
            return "Field cannot be selected if no proof is provided.";
        }
        return undefined;
    };

    // FUNCTION 5: validateVersion - code that validates a version is correctly formatted
    // PRECONDITIONS (2 parameters):
    // 1.) version: a version string, entered by a user
    // 2.) versions: an array of versions
    // 3.) sequence: an optional integer parameter, which represents the sequence of the version we are currently validating
    // POSTCONDITIONS (2 possible outcomes):
    // the function returns a string containing an error message if validation fails
    // otherwise, this function returns undefined, meaning no issues
    const validateVersion = (version, versions, sequence = undefined) => {
        // check if version is well-formed
        if (!versionPattern.test(version)) {
            return "Version must consist of letters, numbers, and periods (.), and cannot start with a period (.).";
        }

        let filteredVersions;
        if (sequence !== undefined) {
            filteredVersions = versions.filter(version => version.sequence !== sequence);
        } else {
            filteredVersions = versions;
        }

        // check for uniqueness
        for (const v of filteredVersions) {
            if (v.version === version) {
                return "Version already exists.";
            }
        }

        return undefined;
    };

    return { validateEmail, validateVideoUrl, validateDate, validateLive, validateVersion };
};

/* ===== EXPORTS ===== */
export default ValidationHelper;