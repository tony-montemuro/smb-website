const GameHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: getGameCategories - function that returns the list of all categories a game has
    // PRECONDITIONS (1 parameter):
    // 1.) game: a game object, that has been taken directly from the `staticCache.games` array
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

    // FUNCTION 2: getCategoryTypes - function that returns an array which contains all the level types in a category (which indicates
    // it's possible chart types)
    // PRECONDITIONS (2 parameters):
    // 1.) game: a game object, that has been taken directly from the `staticCache.games` array
    // 2.) category: a string representing a valid category within the game object (param 1)
    // POSTCONDITIONS (3 possible outcomes):
    // if a game category only has `score` chart_typed levels, an array with a single string "score" is returned
    // if a game category only has `time` chart_typed levels, an array with a single string "time" is returned
    // if a game category has `both` chart_typed levels, OR has both `score` and `time` chart_typed levels, an array with
    // the strings "score" and "time" is returned
    const getCategoryTypes = (game, category) => {
        // first, define the variables used in this function
        let prevCategory;

        // next, loop through each mode, and within each mode within { category }, loop through the levels
        for (const mode of game.mode) {             // for each mode
            if (mode.category === category) {
                for (const level of mode.level) {   // for each level
                    // first, if the chart type is both, we simply return an array with both possible types
                    if (level.chart_type === "both") {
                        return ["score", "time"];
                    }

                    // next, check for the case where the prevCategory variable does not match the level category. by default, this
                    // must mean both types are present in this category
                    if (prevCategory && prevCategory !== level.chart_type) {
                        return ["score", "time"];
                    }
 
                    // finally, update prevCategory
                    prevCategory = level.chart_type;
                };
            }
        };

        // if we made it this far without returning, it means there must only exist a single type within the category, prevCategory
        return [prevCategory];
    };

    return { getGameCategories, getCategoryTypes };
};

/* ===== EXPORTS ===== */
export default GameHelper;