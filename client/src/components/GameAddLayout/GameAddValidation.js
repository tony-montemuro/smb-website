/* ===== IMPORTS ===== */
import { AppDataContext, GameAddContext } from "../../utils/Contexts.js";
import { useContext } from "react";
import { isBefore } from "date-fns";
import { isLowerAlphaNumeric, isUrlSafe } from "../../utils/RegexPatterns.js";
import DateHelper from "../../helper/DateHelper.js";
import ValidationHelper from "../../helper/ValidationHelper.js";

const GameAddValidation = () => {
    /* ===== CONTEXTS ===== */

    // appData state from app data context
    const { appData } = useContext(AppDataContext);

    // structure data state from game add context
    const { structureData } = useContext(GameAddContext);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getInclusiveDate } = DateHelper();
    const { validateDate } = ValidationHelper();

    // FUNCTION 1: validateAbb - function that validates the metadata abb form field
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string, which will correspond to the primary key of the new game in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if the abb contains any upper-case letters, or special characters, return a string that contains the error message
    // if the abb is determined to be valid, return undefined
    const validateAbb = abb => {
        if (!isLowerAlphaNumeric.test(abb)) {
            return "Abbreviation should only contain lowercase letters, and/or numbers.";
        }
    };

    // FUNCTION 2: validateReleaseDate - function that validates the metadata release date form field
    // PRECONDITIONS (1 parameter):
    // 1.) releaseDate: a string, which represents a date. specifically, the release date of the game
    // POSTCONDITIONS (2 possible outcomes):
    // if the relaseDate is not a valid date, or occurs after today, return a string containing the error message
    // if the releaseDate is determined to be valid, return undefined
    const validateReleaseDate = releaseDate => {
        let error = validateDate(releaseDate);
        if (error) {
            return error;
        }

        let today = new Date();
        today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (!isBefore(new Date(releaseDate), getInclusiveDate(today.toLocaleDateString("en-CA")))) {
            error = "Release date cannot be in the future.";
        }
        return error;
    };

    // FUNCTION 3: validateMinDate - function that validates the metadata min_date form field
    // PRECONDITIONS (2 parameters):
    // 1.) minDate: a string, which will correspond to the `min_date` field of the game table
    // 2.) releaseDate: a string, which will correspond to the `release_date` field of the game table
    // POSTCONDITIONS (2 possible outcomes):
    // if minDate is invalid, or occurs AFTER the release date, return a string that contains the error message
    // if minDate is determined to be valid, return undefined
    const validateMinDate = (minDate, releaseDate) => {
        let error = validateDate(minDate);
        if (error) {
            return error;
        }

        if (!isBefore(new Date(minDate), getInclusiveDate(releaseDate))) {
            error = "Minimum Date cannot be after Release Date.";
        }
        return error;
    };

    // FUNCTION 4: validateEntityList - function that ensures each entity list is non-empty
    // PRECONDTIONS (2 parameters):
    // 1.) entities: the entities object from the `EntitiesForm`
    // 2.) entityName: a string containing the name of the entity list we want to validate
    // POSTCONDITIONS (2 possible outcomes):
    // if the entity list is non-empty, this function returns undefined
    // if the entity list is empty, this function returns a string containing an error message
    const validateEntityList = (entities, entityName) => {
        if (entities[entityName].length > 0) {
            return undefined;
        }

        return `Must select at least one ${ entityName }.`;
    };

    // FUNCTION 5: validateCategories - function that validates each category
    // PRECONDITIONS (2 parameters):
    // 1.) categories - the list of categories we want to validate
    // 2.) modes - the list of modes from the structure object
    // POSTCONDITIONS (2 possible outcomes):
    // if we validate the categories list is valid, do not return anything
    // otherwise, return a string with the error message
    const validateCategories = (categories, modes) => {
        if (categories.length === 0) {
            return "Must have at least one category.";
        }

        let errorMsg = "";
        const hasModes = {};
        modes.forEach(mode => {
            const { category } = mode;
            if (!hasModes[category]) {
                hasModes[category] = true;
            }
        });
        let hasInvalid = false, hasMissingModes = false;

        categories.forEach(obj => {
            const { category } = obj;

            // ensure category exists, and is well-formed
            if (!appData.categories[category] || typeof category !== "string") {
                hasInvalid = true;
            }
            if (!hasModes[category]) {
                hasMissingModes = true;
            }
        });

        if (hasInvalid) {
            errorMsg += "One or more categories have invalid values, contact TonySMB for help. ";
        }
        if (hasMissingModes) {
            errorMsg += "One or more categories have no modes and no levels. ";
        }

        return errorMsg ? errorMsg.slice(0, -1) : undefined;
    };

    // FUNCTION 6: handleErrorReturn - function that is called at the end of certain validator functions to handle the return
    // PRECONDITION (1 parameter):
    // 1.) errors: an array of errors
    // POSTCONDITIONS (2 possible outcomes):
    // if the errors array has at least one element, return it, removing the final character from each error (a space)
    // otherwise, return undefined
    const handleErrorReturn = errors => {
        if (errors.length === 0) {
            return undefined;
        }

        // if there is at least one error, let's remove space from end of each
        errors.forEach((error, index) => {
            errors[index] = error.slice(0, -1);
        });

        return errors;
    };

    // FUNCTION 7: duplicateCheck - generic function that checks a "seen" object for duplicates, & updates errors accordingly
    // PRECONDITIONS (3 parameters):
    // 1.) seen: an object, that maps some key to an array of ids
    // 2.) errors: a spare array of error messages
    // 3.) duplicateMessage: the duplicate message we want to render to the user
    // POSTCONDITIONS (1 possible outcome):
    // we iterate over the seen object values. if any have >1 ids, and have a name, we append a duplication error
    const duplicateCheck = (seen, errors, duplicateMessage) => {
        for (const [key, idLists] of Object.entries(seen)) {
            if (idLists.length > 1 && JSON.parse(key).name !== "") {
                idLists.forEach(id => {
                    if (errors[id]) {
                        errors[id] += duplicateMessage;
                    } else {
                        errors[id] = duplicateMessage;
                    }
                });
            }
        }
    };

    // FUNCTION 8: validateModes - function that validates each mode
    // PRECONDITIONS (3 parameters):
    // 1.) modes - the list of modes we want to validate
    // 2.) categories - the list of categories from the structure object
    // 3.) levels - the list of levels from the structure object
    // POSTCONDITIONS (3 possible outcomes):
    // if we validate modes is valid, do not return anything
    // if modes is empty, return a string letting the user know
    // otherwise, return an array, where we map mode id => error message
    const validateModes = (modes, categories, levels) => {
        const errors = [];
        const hasLevels = {}, seenModes = {};
        levels.forEach(level => {
            const { mode } = level;
            if (!hasLevels[mode.name]) {
                hasLevels[mode.name] = true;
            }
        });

        modes.forEach(obj => {
            const { id, name, category } = obj;
            let errorMsg = "";
            
            // ensure category is valid
            if (!categories.map(c => c.category).includes(category)) {
                errorMsg += "Mode belongs to an invalid category, contact TonySMB for help. ";
            }

            // next, ensure mode name is well-formed
            if (typeof name !== "string") {
                errorMsg += "Mode must be a word. ";
            }
            if (name.length === 0) {
                errorMsg += "Mode cannot be empty. ";
            }
            if (name.length > 0 && !isUrlSafe.test(name)) {
                errorMsg += "Mode includes an unsafe special character. ";
            }

            // ensure mode has >0 levels
            if (!hasLevels[name]) {
                errorMsg += "Mode must have at least one level. ";
            }

            // update seenModes object
            const key = JSON.stringify({ name, category });
            if (!seenModes[key]) {
                seenModes[key] = [id];
            } else {
                seenModes[key].push(id);
            }

            // if any errors were identified, let's update errors array
            if (errorMsg) {
                errors[id] = errorMsg;
            }
        });

        // finally, check for duplicate modes within each category
        const duplicateMessage = "Duplicate mode within this category. ";
        duplicateCheck(seenModes, errors, duplicateMessage);
        return handleErrorReturn(errors);
    };

    // FUNCTION 9: validateLevels - function that validates each level
    // PRECONDITIONS (3 parameters):
    // 1.) levels - the list of levels we want to validate
    // 2.) categories - the list of categories from the structure object
    // 3.) modes - the list of modes from the structure object
    // POSTCONDITIONS (3 possible outcomes):
    // if we validate that `levels` is valid, do not return anything
    // if `levels` is empty, return a string letting the user know
    // otherwise, return an array, where we map level id => error message
    const validateLevels = (levels, categories, modes) => {
        const errors = [];
        const seenCharts = {};

        levels.forEach(level => {
            const { ascending, category, chart_type, goal, id, mode, name, time, timer_type } = level;
            let errorMsg = "";

            // first, validate category is valid
            if (!categories.map(c => c.category).includes(category)) {
                errorMsg += "Level assigned to invalid category, contact TonySMB for help. ";
            }

            // next, validate mode is valid
            if (!modes.map(m => m.id).includes(mode.id)) {
                errorMsg += "Level assigned to invalid mode, contact TonySMB for help. ";
            }

            // next, validate id is an integer
            if (typeof id !== "number" || !Number.isInteger(id)) {
                errorMsg += "Level assigned an invalid id, contact TonySMB for help. ";
            }

            // next, the level name is safe, well-formatted
            if (name.length === 0) {
                errorMsg += "Name is required. ";
            }
            if (name.length > 0 && !isUrlSafe.test(name)) {
                errorMsg += "Name includes an unsafe special character. ";
            }

            // next, validate the goal is safe, well-formatted
            if (!appData.goals.some(g => g.name === goal) && goal !== "") {
                errorMsg += "Goal is not a valid value. ";
            }

            // next, let's handle fields dependent on chart type
            if (chart_type === "score") {
                if (timer_type !== "") {
                    errorMsg += "Timer Type should be unset when Chart Type is Score. ";
                }
                if (time !== 0) {
                    errorMsg += "Time should be 0 when Chart Type is Score. ";
                }
                if (["both", "time"].includes(ascending)) {
                    errorMsg += "Ascend Time cannot be checked when Chart Type is Score. ";
                }
            } else {
                if (timer_type === "") {
                    errorMsg += "Timer Type is required when Chart Type is Time or Both. ";
                }
                if (chart_type === "time" && ["both", "score"].includes(ascending)) {
                    errorMsg += "Ascend Score cannot be checked when Chart Type is Time." ;
                }
            }

            // next, let's handle fields dependent on ascending
            if (["time", "both"].includes(ascending)) {
                if (time !== 0) {
                    errorMsg += "Time must be 0 when Ascending Time is checked. ";
                }
            }

            // next, let's validate chart type
            if (!structureData.chartTypes.includes(chart_type)) {
                errorMsg += "Chart Type is not a valid value. ";
            }

            // next, let's validate timer type
            if (timer_type !== "" && !structureData.timerTypes.includes(timer_type)) {
                errorMsg += "Timer Type is not a valid value. ";
            }

            // TODO: this should be fixed with a timer type update. for now, this works.
            // next, let's validate time
            if (time === "") {
                errorMsg += "Time is required. ";
            } else {
                const fraction = String(time).split(".")[1];
                if (timer_type.endsWith("msec")) {
                    if (fraction && fraction.length > 3) {
                        errorMsg += "Invalid number of decimals on time. ";
                    }
                } else if (timer_type.endsWith("csec")) {
                    if (fraction && fraction.length > 2) {
                        errorMsg += "Invalid number of decimals on time. ";
                    }
                } else {
                    if (fraction) {
                        errorMsg += "Invalid number of decimals on time. ";
                    }
                }
            }
            
            // update seenCharts object
            const key = JSON.stringify({ category, name, goal });
            if (!seenCharts[key]) {
                seenCharts[key] = [id];
            } else {
                seenCharts[key].push(id);
            }

            if (errorMsg) {
                errors[id] = errorMsg;
            }
        });

        // finally, check for duplicate name + goal combinations within each category
        const duplicateMessage = "Duplicate Name + Goal combination within this category. ";
        duplicateCheck(seenCharts, errors, duplicateMessage);        
        return handleErrorReturn(errors);
    };

    // FUNCTION 10: validateMetadata - function that validates data from the metadata form
    // PRECONDITIONS (1 parameter):
    // 1.) metadata: the metadata object we need to validate
    // POSTCONDITIONS (1 possible outcome):
    // an error object is returned, containing any error messages (empty object means no errors)
    const validateMetadata = metadata => {
        const error = {};

        error.abb = validateAbb(metadata.abb);
        error.release_date = validateReleaseDate(metadata.release_date);
        if (metadata.custom) {
            error.min_date = validateMinDate(metadata.min_date);
        }

        return error;
    };

    // FUNCTION 11: validateEntities - function that validates data from the entities form
    // PRECONDITIONS (1 parameter):
    // 1.) entities: the entites object we need to validate
    // POSTCONDITIONS (1 possible outcome):
    // an error object is returned, containing any error messages (empty object means no errors)
    const validateEntities = entities => {
        const error = {};
        const entitiesToIgnore = ["moderator"];

        Object.keys(entities).forEach(entityName => {
            if (!entitiesToIgnore.includes(entityName)) {
                error[entityName] = validateEntityList(entities, entityName);
            }
        });

        return error;
    };

    // FUNCTION 12: validateStructure - function that validates data from the structures form
    // PRECONDITIONS (1 parameter):
    // 1.) structure: the structure object we need to validate
    // POSTCONDITIONS (1 possible outcome):
    // an error object is returned, containing any error messages (empty object means no errors)
    const validateStructure = structure => {
        const error = {};
        const { category, mode, level } = structure;

        error.category = validateCategories(category, mode);
        error.mode = validateModes(mode, category, level);
        error.level = validateLevels(level, category, mode);
        
        return error;
    };

    return { validateMetadata, validateEntities, validateStructure };
};

/* ===== EXPORTS ===== */
export default GameAddValidation;