const User = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: alertDiscord - alert the client of a discord username
    // PRECONDITIONS (1 parameter):
    // 1.) discord: a string value, representing a discord username.
    // POSTCONDITION:
    // an alert popup is thrown by the browser, containing a message that displays the discord username
    const alertDiscord = discord => {
        alert(`Discord username: ${ discord }.`);
    };

    return { alertDiscord };
};

/* ===== EXPORTS ===== */
export default User;