const User = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: alertDiscord - alert the client of a discord username
    // PRECONDITIONS (1 parameter):
    // 1.) discord: a string value, representing a discord username.
    // POSTCONDITIONS (1 possible outcome):
    // an alert popup is thrown by the browser, containing a message that displays the discord username
    const alertDiscord = discord => {
        alert(`Discord username: ${ discord }.`);
    };

    // FUNCTION 2: getVideoId - given a video url, fetch the video id
    // PRECONDITIONS (1 parameter):
    // 1.) url: a YouTube url, which can basically be any video URL format (there are many...)
    // POSTCONDITIONS (1 possible outcome):
    // the video's id is returned, depending on the url type
    const getVideoId = url => {
        const substr = "v=";

        // Case 1: URL includes the '=v' substring. when this is the case, the video id is the following 11 characters.
        if (url.includes(substr)) {
            const startIndex = url.indexOf(substr)+2;
            const endIndex = startIndex+11;
            const id = url.substring(startIndex, endIndex);
            return id;

        // Case 2: URL does not include the '=v' substring. when this is the case, the video id is just the last 11 characters.
        } else {
            return url.slice(-11);
        }
    };

    return { alertDiscord, getVideoId };
};

/* ===== EXPORTS ===== */
export default User;