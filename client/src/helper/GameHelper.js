const GameHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: cleanGameObject - function that takes a game object freshly called from the db, and cleans up many-to-many relationships
    // PRECONDITIONS (1 parameter):
    // 1.) game: a game object freshly called from the database. NOTE: This function MODIFIES this parameter!
    // POSTCONDITIONS (1 possible outcome):
    // all many-to-many relationships are resolved within the object
    const cleanGameObject = game => {
        // first, handle the game <==> monkey relationship
        game.monkey = [];
        game.game_monkey.forEach(row => game.monkey.push(row.monkey));
        delete game.game_monkey;

        // next, handle the game <==> region relationship
        game.region = [];
        game.game_region.forEach(row => game.region.push(row.region));
        delete game.game_region;

        // next, handle the game <==> rule relationship
        game.rule = [];
        game.game_rule.forEach(row => game.rule.push(row.rule));
        delete game.game_rule;

        // finally, handle the game <==> platform relationship
        game.platform = [];
        game.game_platform.forEach(row => game.platform.push(row.platform));
        delete game.game_platform;
    };

    // FUNCTION 2: getGameCategories - function that returns the list of all categories a game has
    // PRECONDITIONS (1 parameter):
    // 1.) game: a game object, which may have limited details, or is fully detailed
    // POSTCONDITIONS (1 possible outcome):
    // all unique categories of the game are returned in an array
    const getGameCategories = game => {
        const categories = [];

        // special case: game has limited details. in this case, it *should* have a field called `categories`. we can use
        // the data from this
        if (!game.mode) {
            game.categories.forEach(category => {
                categories.push(category.abb);
            });
        }

        // general case: game is heavily detailed
        else {
            game.mode.forEach(mode => {
                if (!categories.includes(mode.category)) {
                    categories.push(mode.category);
                }
            });
        }

        return categories;
    };

    // FUNCTION 3: getCategoryTypes - function that returns an array which contains all the level types in a category (which indicates
    // it's possible chart types)
    // PRECONDITIONS (2 parameters):
    // 1.) game: a game object, which may have limited details, or is fully detailed
    // 2.) categoryName: a string representing a valid category within the game object (param 1)
    // POSTCONDITIONS (3 possible outcomes):
    // if a game category only has `score` chart_typed levels, an array with a single string "score" is returned
    // if a game category only has `time` chart_typed levels, an array with a single string "time" is returned
    // if a game category has `both` chart_typed levels, OR has both `score` and `time` chart_typed levels, an array with
    // the strings "score" and "time" is returned
    const getCategoryTypes = (game, categoryName) => {
        // special case: game has limited details. in this case, game object *should* have a field called `categories`, which
        // should point to an object with the `types` field. we can use this data to get category types
        if (!game.mode) {
            const category = game.categories.find(category => category.abb === categoryName);
            if (category.types.includes("both")) {
                return ["score", "time"];
            } else {
                return category.types.sort();
            }
        }

        // general case: game has full details.
        // first, define the variables used in this function
        let prevCategory;

        // next, loop through each mode, and within each mode within { categoryName }, loop through the levels
        for (const mode of game.mode) {             // for each mode
            if (mode.category === categoryName) {
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

    // FUNCTION 4: getRelevantModes - given a game object, category, and type, return the array of "relevant" modes
    // PRECONDITIONS (3 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) category: a string representing a valid category
    // 3.) type: the current type, either "time" or "score"
    // POSTCONDITIONS (1 possible outcome):
    // an array of mode objects who have at least 1 chart where the chart_type is either `${ type }` or "both"
    // is returned
    const getRelevantModes = (game, category, type) => {
        // declare the modes array, and initialize as an empty array
        const modes = [];

        game.mode.forEach(mode => {             // for each mode
            // only worry about modes who belong to category
            if (mode.category === category) {
                // declare isRelevant, a boolean flag which is intialized to false
                let isRelevant = false;

                mode.level.forEach(level => {   // for each level in each mode
                    // if chart_type is either both or `${ type }`, then the mode is relevant. thus, update the isRelevant flag
                    // to true
                    if (["both", type].includes(level.chart_type)) {
                        isRelevant = true;
                    }
                });

                // if isRelevant flag was updated to true, we push the mode object into modes
                if (isRelevant) {
                    modes.push(mode);
                }
            }
        });

        return modes;
    };

    // FUNCTION 5: fetchLevelFromGame - given a game object, level name, & category, determine if the level is present in the object, and
    // return it
	// PRECONDITIONS (4 parameters):
	// 1.) game: an object containing information about the game defined in the path
	// 2.) levelName: a string corresponding to the name of a level, also defined in the path
    // 3.) category: a string value representing a valid category
	// 4.) type: a string value, either "score" or "time"
	// POSTCONDITIONS (2 outcomes):
	// if the level is found in the game object, return the corresponding level object
	// otherwise, just return null
	const fetchLevelFromGame = (game, levelName, category, type) => {
		for (const mode of game.mode) {				// for each mode in the game object
			if (mode.category === category) {
				for (const level of mode.level) {	// for each level in the mode object
					if (level.name === levelName && (level.chart_type === type || level.chart_type === "both")) {
						return level;
					}
				}
			}
		}
		return null;
	};

    // TODO: this is a fine temporary solution, but should be generalized better - need to rework timer system!
    // FUNCTION 6: getDecimals - function that takes an array of levels, and determines the decimals
    // PRECONDITIONS (1 parameter):
    // 1.) levels: an array of level objects, each should contain the `timer_type` field, or this function WILL fail!
    // POSTCONDITIONS (2 possible outcomes):
    // if even a single level exists with a `timer_type` ending in 'msec', we return 3
    // otherwise, return 2
    const getDecimals = levels => {
        return levels.some(level => level.timer_type !== null && level.timer_type.endsWith("msec")) ? 3 : 2;
    };

    return { 
        cleanGameObject,
        getGameCategories,
        getCategoryTypes,
        getRelevantModes,
        fetchLevelFromGame,
        getDecimals
    };
};

/* ===== EXPORTS ===== */
export default GameHelper;