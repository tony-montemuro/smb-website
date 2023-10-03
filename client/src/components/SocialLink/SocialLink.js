/* ===== IMPORTS ===== */
import Twitch from "../../img/Twitch.jsx";
import X from "../../img/X.jsx";
import Youtube from "../../img/Youtube.jsx";

const SocialLink = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: handleClick - code that executes when the social link component is clicked
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user clicks the component
    // POSTCONDITIONS (1 possible outcome):
    // the `stopPropagation` method is executed to prevent `onClick` code from parent components from running
    const handleClick = e => {
        e.stopPropagation();
    };

    // FUNCTION 2: getLink - function that takes the name and username, and generates the approprate link
    // PRECONDITIONS (2 parameters):
    // 1.) name: a string representing the name of a social media platform; should be one of the following strings:
    // "youtube", "twitch", "twitter".
    // 2.) username: a handle of some kind, which is unique to the user
    // POSTCONDITIONS (1 possible outcome):
    // the appropriate string representing the link is returned
    const getLink = (name, username) => {
        switch (name) {
            case "youtube":
                return `https://www.youtube.com/${ username }`;
            case "twitch":
                return `https://www.twitch.tv/${ username }`;
            case "twitter":
                return `https://twitter.com/${ username }`;
            default:
                return undefined;
        };
    };

    // FUNCTION 3: getLogo - function that takes a social media name, and returns the code for it's logo
    // PRECONDITIONS (1 parameter):
    // 1.) name: a string representing the name of a social media platform; should be one of the following strings:
    // "youtube", "twitch", "twitter"
    // POSTCONDTIONS (1 possible outcome):
    // the appropriate logo is returned
    const getLogo = name => {
        switch (name) {
            case "youtube":
                return <Youtube />;
            case "twitch":
                return <Twitch />;
            case "twitter":
                return <X />;
            default:
                return null;
        };
    };

    return { handleClick, getLink, getLogo };
};

/* ===== EXPORTS ===== */
export default SocialLink;