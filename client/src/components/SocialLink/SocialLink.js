/* ===== IMPORTS ===== */

const SocialLink = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: getLink - function that takes the name and username, and generates the approprate link
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

    return { getLink };
};

/* ===== EXPORTS ===== */
export default SocialLink;