/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext } from "react";
import GameAddValidation from "../../components/GameAddLayout/GameAddValidation";

const GameAddSummary = (setError) => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== FUNCTIONS ===== */

    // validation functions
    const { validateEntities, validateMetadata, validateStructure } = GameAddValidation();

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
        // generic helper function to extract information from most entities
        const extract = name => {
            return entities[name].map(e => {
                return {
                    id: e.id,
                    game: abb,
                    [name]: e[name]
                };
            });
        };

        const game_monkey = extract("monkey");
        const game_platform = extract("platform");
        const game_region = extract("region");
        const game_rule = extract("rule");
        const game_profile = entities.moderator.map(moderator => {
            return {
                game: abb,
                profile: moderator.id
            };
        });

        return { game_monkey, game_platform, game_profile, game_region, game_rule };
    };

    // FUNCTION 4: hasMessages - simple function that checks if an error object has any defined messages
    // PRECONDITIONS (1 parameter):
    // 1.) error: an error object, that maps input names to error messages
    // POSTCONDITIONS (2 possible outcomes):
    // if the error object has at least one defined error message, return true
    // otherwise, return false
    const hasMessages = error => {
        return error.some(message => message !== undefined);
    };
    
    // FUNCTION 5: getErrorMessage - function that determines the error message, based on the `errorList` object
    // PRECONDITIONS (1 parameter):
    // 1.) errorList: an array of error objects
    // POSTCONDITIONS (1 possible outcome):
    // a string is returned with the error message that should be rendered to the user
    const getErrorMessage = errorList => {
        const sections = [];
        if (Object.values(errorList["metadata"]).some(error => hasMessages(error))) {
            sections.push("Main Information");
        }
        if (Object.keys(errorList["entities"]).some(error => hasMessages(error))) {
            sections.push("Game Entities");
        }
        if (Object.keys(errorList["structure"]).some(error => hasMessages(error))) {
            sections.push("Game Structure");
        }

        let sectionStr;
        switch (sections.length) {
            case 1:
                sectionStr = `${ sections[0] } section`;
            case 2:
                sectionStr = `${ sections.join(" and ") } sections`;
            default:
                sectionStr = `${ sections.join(", ") } sections`;
        }

        return `Game could not be added, errors discovered in ${ sectionStr }. Go back to the problematic sections, fix the areas marked red, and try again. To ensure the problematic areas are fixed, you can always re-validate.`;
    };

    // FUNCITON 6: createGame - code that is executed when the user requests to create the game
    // PRECONDITIONS (4 parameters):
    // 1.) e: the event object generated by the submit event
    // 2.) metadata: the user-entered game metadata
    // 3.) entities: the user-entered game entities
    // 4.) structure: the user-entered game structure
    // POSTCONDITIONS (3 possible outcomes):
    // if the data is validated, and everything is uploaded properly, let the user know, and reset the `Add Game` form
    // if the data is validated, but some data fails to upload, let the user know what exactly failed, and return
    // if the data is invalid, let the user know where the issues lie, and return early 
    const createGame = (e, metadata, entities, structure) => {
        e.preventDefault();

        // first, we need to validate the data one last time
        const errorList = {};
        errorList["metadata"] = validateMetadata(metadata);
        errorList["entities"] = validateEntities(entities);
        errorList["structure"] = validateStructure(structure);

        // if there are any errors with messages
        setError(errorList);
        if (Object.values(errorList).some(error => hasMessages(error))) {
            addMessage(getErrorMessage(errorList), "error", 25000);
            return;
        }

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