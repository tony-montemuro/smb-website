/* ===== IMPORTS ===== */
import { youtubePattern, youtubeTimestampPattern } from "../utils/RegexPatterns";

const EmbedHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: getYoutubeVideoId - function that takes a youtube video url as input, and returns the video id
    // PRECONDITIONS (1 parameter):
    // 1.) url: a string representing the URL of a YouTube URL
    // POSTCONDITIONS (2 possible outcomes):
    // if the url is valid, the video id will be returned
    // otherwise, a null object is returned
    const getYoutubeVideoId = url => {
        const match = url.match(youtubePattern);
        return (match && match[1].length === 11) ? match[1] : null; 
    };

    // FUNCTION 2: getYoutubeVideoOpts - function that creates the `opt` object for the youtube player
    // PRECONDITIONS (1 parameter):
    // 1.) url: a string representing the URL of a YouTube URL
    // POSTCONDITIONS (2 possible outcomes):
    // if there is a timestamp detected in the URL, get the value, and pass it in the opts object
    // otherwise, return an empty object
    const getYoutubeVideoOpts = url => {
        // determine if there is a timestamp at all
        const match = url.match(youtubeTimestampPattern);

        // if there is, we return an `opts` object. otherwise, a null object.
        return match ? 
            {
                playerVars: {
                    start: parseInt(match[1]),
                }
            }
        :
            {};
    };

    return { getYoutubeVideoId, getYoutubeVideoOpts };
};

/* ===== EXPORTS ===== */
export default EmbedHelper;
