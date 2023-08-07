/* ===== IMPORTS ===== */
import { youtubePattern, twitchPattern, twitterPatttern } from "../utils/RegexPatterns";

const EmbedHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: getUrlType - function that takes a url as input, and returns it's type
    // PRECONDITIONS (1 parameter):
    // 1.) url: a string representing a url
    // POSTCONDITIONS (1 possible outcome):
    // using regex, we determine if the url is from youtube, twitch, or other
    const getUrlType = url => {
        // first, check if it's a youtube video
        if (youtubePattern.test(url)) {
            return "youtube";
        }

        // next, check if it's a url from twitch
        if (twitchPattern.test(url)) {
            // based on the style of the twitch url, return the type (twitch-vod or twitch-clip)
            const match = url.match(twitchPattern);
            if (match[1]) {
                return "twitch-vod";
            }
            if (match[3] || match[4]) {
                return "twitch-clip";
            }
        }

        // next, check if it's a tweet
        if (twitterPatttern.test(url)) {
            return "twitter";
        }

        // otherwise, just return a null object
        return null;
    };

    return { getUrlType };
};

/* ===== EXPORTS ===== */
export default EmbedHelper;