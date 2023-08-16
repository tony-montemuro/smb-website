const GameHelper = () => {
    /* ===== FUNCTIONS ===== */
    
    // FUNCTION 1: hasMiscCategory - function that determines whether or not a game has a miscellaneous category
    const hasMiscCategory = game => {
        return game.mode.find(mode => mode.misc);
    };

    // FUNCTION 2: getGameCategories - function that returns the list of all categories a game has
    // PRECONDITIONS (1 parameter):
    // 1.) a game object, that has been taken directly from the `staticCache.games` array
    // POSTCONDITIONS (1 possible outcome):
    // all unique categories of the game are returned in an array
    const getGameCategories = game => {
        const categories = [];
        game.mode.forEach(mode => {
            if (!categories.includes(mode.category)) {
                categories.push(mode.category);
            }
        });
        return categories;
    };

    return { hasMiscCategory, getGameCategories };
};

/* ===== EXPORTS ===== */
export default GameHelper;