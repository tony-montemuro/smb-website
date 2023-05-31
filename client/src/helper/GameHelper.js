const GameHelper = () => {
    /* ===== FUNCTIONS ===== */
    
    // FUNCTION 1: hasMiscCategory - function that determines whether or not a game has a miscellaneous category
    const hasMiscCategory = game => {
        return game.mode.find(mode => mode.misc);
    };

    return { hasMiscCategory };
};

/* ===== EXPORTS ===== */
export default GameHelper;