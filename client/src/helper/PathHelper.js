const PathHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: fetchLevelFromGame: given a game object, level name, & category, determine if the level is present in the object, and
    // return it
	// PRECONDITIONS (3 parameters):
	// 1.) game: an object containing information about the game defined in the path
	// 2.) levelName: a string corresponding to the name of a level, also defined in the path
    // 3.) category: a string value, either "main" or "misc"
	// POSTCONDITIONS (2 outcomes):
	// if the level is found in the game object, return the corresponding level object
	// otherwise, just return null
	const fetchLevelFromGame = (game, levelName, category) => {
		const isMisc = category === "misc" ? true : false;
		for (const mode of game.mode) {				// for each mode in the game object
			if (mode.misc === isMisc) {
				for (const level of mode.level) {	// for each level in the mode object
					if (level.name === levelName) {
						return level;
					}
				}
			}
		}
		return null;
	};

    return { fetchLevelFromGame };
};

/* ===== EXPORTS ===== */
export default PathHelper;