const DiscordLogo = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: handleClick - code that executes when the discord logo component is clicked
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user clicks the component
    // POSTCONDITIONS (1 possible outcome):
    // the `stopPropagation` method is executed to prevent `onClick` code from parent components from running
    const handleClick = e => {
        e.stopPropagation();
    };
    
    // FUNCTION 2: alertDiscord - function that will alert the user of a discord account
    // PRECONDITIONS (1 parameter):
    // 1.) discord: a string value, representing a discord username.
    // POSTCONDITIONS (1 possible outcome):
    // an alert popup is thrown by the browser, containing a message that displays the discord username
    const alertDiscord = discord => {
        alert(`Discord username: ${ discord }`);
    };

    return { handleClick, alertDiscord };
};

/* ===== EXPORTS ===== */
export default DiscordLogo;