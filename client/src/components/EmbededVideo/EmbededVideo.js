/* ===== IMPORTS ===== */
import { googleDrivePattern, imgurPattern, twitchPattern, twitterPatttern, youtubePattern, youtubeTimestampPattern, timerPattern } from "../../utils/RegexPatterns";

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

        // next, check if it's a tweet
        if (twitterPatttern.test(url)) {
            return "twitter";
        }

        // then, check if it's an imgur link
        if (imgurPattern.test(url)) {
            return "imgur";
        }

        // then, check if it's a google drive link
        if (googleDrivePattern.test(url)) {
            return "google-drive";
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
        let time = match ? match[1] : undefined;
        if (match && time.split("").some(c => ["h", "m", "s"].includes(c))) {
            const timerMatch = time.match(timerPattern);
            const hours = timerMatch[2] || 0;
            const minutes = timerMatch[4] || 0;
            const seconds = timerMatch[6] || 0;
            time = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds); 
        }

        // if there is, we add it to the opts object, and return.
        return time ? 
            { 
                ...opts,
                playerVars: {
                    start: parseInt(time),
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
    
    // FUNCTION 6: getTweetId - function that gets the tweet ID from a url for embeds
    // PRECONDITIONS (1 parameter):
    // 1.) url: a string representing the url of a tweet
    // POSTCONDITIONS (1 possible outcome):
    // a string is returned representing the id of the tweet, which is necessary for embeds
    const getTweetId = url => {
        const match = url.match(twitterPatttern);
        const id = match[2];
        return id;
    };
    
    // FUNCTION 7: getImgurId - function that gets the imgur id from a url for embeds
    // PRECONDITIONS (1 paramter):
    // 1.) url: a string representing the url of an imgur post
    // POSTCONDITIONS (1 possible outcome):
    // a string is returned representing the id of the imgur post
    const getImgurId = url => {
        const match = url.match(imgurPattern);
        const id = match[1];
        return id;
    }
    
    // FUNCTION 8: getGoogleDriveSource - function that gets the source URL for a google drive link used in embeds
    // PRECONDITIONS (1 parameter):
    // 1.) url: a string representing the url of a google drive file url
    // POSTCONDITIONS (1 possible outcome):
    // a string is returned representing the src url (must be transformed from the input)
    const getGoogleDriveSource = url => {
        const match = url.match(googleDrivePattern);
        const id = match[1];
        return `https://drive.google.com/file/d/${ id }/preview`;
    };

    return { 
        getUrlType, 
        getYoutubeVideoId, 
        getYoutubeVideoOpts, 
        getTwitchVodSource, 
        getTwitchClipSource, 
        getTweetId,
        getImgurId,
        getGoogleDriveSource
    };
};

/* ===== EXPORTS ===== */
export default EmbededVideo;