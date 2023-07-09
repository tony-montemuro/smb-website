const User = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: alertDiscord - alert the client of a discord username
    // PRECONDITIONS (1 parameter):
    // 1.) discord: a string value, representing a discord username.
    // POSTCONDITIONS (1 possible outcome):
    // an alert popup is thrown by the browser, containing a message that displays the discord username
    const alertDiscord = discord => {
        alert(`Discord username: ${ discord }`);
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

    return { alertDiscord, getLink };
};

/* ===== EXPORTS ===== */
export default User;