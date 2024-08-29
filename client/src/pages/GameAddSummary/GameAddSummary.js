const GameAddSummary = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: metadataToGame - takes the metadata object, and transforms it into a "game" object that is compatible
    // with DB schema
    // PRECONDITIONS (1 parameter):
    // 1.) metadata: a metadata object, which corresponds to the game table in the DB
    // POSTCONDITIONS (1 possible outcome):
    // a copy of `metadata` is returned, fixing the creator field
    const metadataToGame = metadata => {
        return { ...metadata, creator: metadata.creator.id };
    }

    // FUNCTION 2: extractStructureData - takes the game's abb, as well as structure, and extracts mode and level information
    // PRECONDITIONS (2 parameters):
    // 1.) abb: a string representing the abb of the game we want to add
    // 2.) structure: a structure object (see StructureForm for more details)
    // POSTCONDITIONS (2 returns, 1 possible outcome):
    // an object is returned, with two fields:
        // a.) mode: the list of modes we are adding
        // b.) level: the list of levels we are adding
    const extractStructureData = (abb, structure) => {
        const mode = structure.mode.map(mode => {
            return { ...mode, game: abb };
        });
        const level = structure.level.map(level => {
            return {
                ...level,
                game: abb,
                mode: level.mode.name
            };
        });

        return { mode, level };
    };

    // FUNCTION 3: extractEntitiesData - takes the game's abb, as well as the game's entities object, and extracts 
    // all the entities
    // PRECONDITIONS (2 parameters):
    // 1.) abb: a string representing the abb of the game we want to add
    // 2.) entities: an entities object (see EntitiesForm for more details)
    // POSTCONDITIONS (5 returns, 1 possible outcome):
    // an object is returned, with five fields:
        // a.) game_monkey: the list of monkeys we are adding
        // b.) game_platform: the list of platforms we are adding
        // c.) game_profile: the list of moderators we are adding
        // d.) game_region: the list of regions we are adding
        // e.) game_rule: the list of rules we are adding
    const extractEntitiesData = (abb, entities) => {
        const game_monkey = entities.monkey.map(monkey => {
            return {
                id: monkey.id,
                game: abb,
                monkey: monkey.monkey,
            };
        });
        const game_platform = entities.platform.map(platform => {
            return {
                id: platform.id,
                game: abb,
                platform: platform.platform
            };
        });
        const game_profile = entities.moderator.map(moderator => {
            return {
                game: abb,
                profile: moderator.id
            };
        });
        const game_region = entities.region.map(region => {
            return {
                id: region.id,
                game: abb,
                region: region.region
            };
        });
        const game_rule = entities.rule.map(rule => {
            return {
                id: rule.id,
                game: abb,
                rule: rule.rule
            };
        });

        return { game_monkey, game_platform, game_profile, game_region, game_rule };
    };

    // FUNCITON 4: createGame - code that is executed when the user requests to create the game
    const createGame = (e, metadata, entities, structure) => {
        e.preventDefault();

        // first, we need to validate the data one last time

        // next, prepare the data for upload
        const game = metadataToGame(metadata);
        const abb = game.abb;
        const { mode, level } = extractStructureData(abb, structure);
        const { game_monkey, game_platform, game_profile, game_region, game_rule } = extractEntitiesData(abb, entities);

        // finally, upload data
    };

    return { createGame };
};

/* ===== EXPORTS ===== */
export default GameAddSummary;