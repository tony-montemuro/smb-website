const GameAddSummary = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCITON 1: createGame - code that is executed when the user requests to create the game
    const createGame = e => {
        e.preventDefault();

        console.log("hi!");
    };

    return { createGame };
};

/* ===== EXPORTS ===== */
export default GameAddSummary;