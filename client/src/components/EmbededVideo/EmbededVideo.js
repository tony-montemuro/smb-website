/* ===== IMPORTS ===== */
import { youtubePattern, twitchPattern, youtubeTimestampPattern } from "../../utils/RegexPatterns";

const EmbededVideo = () => {
    /* ===== VARIABLES ===== */
    const hostName = window.location.hostname;

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

        // otherwise, just return a null object
        return null;
    };

    // FUNCTION 2: getYoutubeVideoId - function that takes a youtube video url as input, and returns the video id
    // PRECONDITIONS (1 parameter):
    // 1.) url: a string representing the URL of a YouTube URL
    // POSTCONDITIONS (2 possible outcomes):
    // if the url is valid, the video id will be returned
    // otherwise, a null object is returned
    const getYoutubeVideoId = url => {
        const match = url.match(youtubePattern);
        return (match && match[1].length === 11) ? match[1] : null; 
    };

    // FUNCTION 3: getYoutubeVideoOpts - function that creates the `opt` object for the youtube player
    // PRECONDITIONS (1 parameter):
    // 1.) url: a string representing the URL of a YouTube URL
    // POSTCONDITIONS (2 possible outcomes):
    // if there is a timestamp detected in the URL, get the value, and pass it in the opts object
    // otherwise, return an empty object
    const getYoutubeVideoOpts = url => {
        // determine if there is a timestamp at all
        const match = url.match(youtubeTimestampPattern);
        const opts = {
            width: "100%",
            height: "100%"
        }

        // if there is, we add it to the opts object, and return.
        return match ? 
            { 
                ...opts,
                playerVars: {
                    start: parseInt(match[1]),
                }
            }
        :
            opts;
    };

    // FUNCTION 4: getTwitchVodSource - function that returns a source URL for a twitch vod used in embeds
    // PRECONDITIONS (1 parameter):
    // 1.) url: a string representing the url of a twitch vod; particuarlly, for a vod. any other url will cause unexpected
    // behavior
    // POSTCONDITIONS (1 possible outcome):
    // a string is returned representing the src url (must be transformed from the input)
    const getTwitchVodSource = url => {
        const match = url.match(twitchPattern);
        const videoId = match[1];
        const timestamp = match[2];
        return `https://player.twitch.tv/?video=${ videoId }&parent=${ hostName }${ timestamp ? `&time=${ timestamp }` : "" }`;
    };

    // FUNCTION 5: getTwitchClipSource - function that returns a source URL for a twitch clip used in embeds
    // PRECONDITIONS (1 parameter):
    // 1.) url: a string representing the url of a twitch clip; particuarlly, for a clip. any other url will cause unexpected behavior
    // POSTCONDITIONS (1 possible outcome):
    // a string is returned representing the src url (must be transformed from the input)
    const getTwitchClipSource = url => {
        const match = url.match(twitchPattern);
        let clipId = match[3];
        clipId = match[3] ? clipId : match[4];
        return `https://clips.twitch.tv/embed?clip=${ clipId }&parent=${ hostName }`;
    };

    return { getUrlType, getYoutubeVideoId, getYoutubeVideoOpts, getTwitchVodSource, getTwitchClipSource };
};

/* ===== EXPORTS ===== */
export default EmbededVideo;