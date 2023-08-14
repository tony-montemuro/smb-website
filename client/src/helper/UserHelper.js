const UserHelper = () => {
    /* ===== FUNCTIONS ===== */
    
    // FUNCTION 1: alertDiscord - function that will alert the user of a discord account
    // PRECONDITIONS (1 parameter):
    // 1.) discord: a string value, representing a discord username.
    // POSTCONDITIONS (1 possible outcome):
    // an alert popup is thrown by the browser, containing a message that displays the discord username
    const alertDiscord = discord => {
        alert(`Discord username: ${ discord }`);
    };

    return { alertDiscord };
};

/* ===== EXPORTS ===== */
export default UserHelper;