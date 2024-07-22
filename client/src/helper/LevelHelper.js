/* ===== IMPORTS ===== */
import { isAlphaPattern } from "../utils/RegexPatterns.js";
import FrontendHelper from "./FrontendHelper.js";

const LevelHelper = () => {
    /* ===== VARIABLES ===== */
    const specialChars = [".", "-", "("];
    const replaceStrs = { "%3F": "?" };

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { snakeToTitle } = FrontendHelper();

    // FUNCTION 1: levelB2F ("level backend to frontend") - code that takes the level in snake case, and converts it to 
    // a format the user is familiar with
    // PRECONDITIONS (1 parameter):
    // 1.) level: an unformatted level name
    // POSTCONDITIONS (1 possible outcome):
    // returns a copy of level in title case, as well as handling strange edge cases such as dashes, dots, etc.
    const levelB2F = level => {
        let cleanedLevel = snakeToTitle(level);

        // handle special characters
        for (let i = 0; i < cleanedLevel.length; i++) {
            if (i > 0 && specialChars.includes(cleanedLevel[i-1])) {
                const former = cleanedLevel.substr(0, i), later = cleanedLevel.substr(i+1);
                cleanedLevel = former + cleanedLevel[i].toUpperCase() + later;
            }
        }

        // handle strings to replace
        for (let [target, value] of Object.entries(replaceStrs)) {
            cleanedLevel = cleanedLevel.replaceAll(target, value);
        }
        
        return cleanedLevel;
    };

    // FUNCTION 2: levelB2F ("level back to front") - function that converts a level in frontend format to backend format
    // PRECONDITIONS (1 parameter):
    // 1.) level: a string representing a level name, in title case, which the user is familiar with
    // POSTCONDITIONS (1 possible outcome):
    // the level is converted to a format familiar to the DB
    const levelF2B = level => {
        // THIS FUNCTION NEEDS WORK: need to figure out alternate capitalizations between "words", which are
        // split by many different special characters
        let backendLevel = "";

        for (let i = 0; i < level.length; i++) {
            const c = level[i];

            if (isAlphaPattern.test(c)) {
                backendLevel += c.toLowerCase();
            } else if (c === " ") {
                backendLevel += "_";
            } else if (c === "_") {
                backendLevel += "__";
            } else if (Object.keys(replaceStrs).includes(c)) {
                backendLevel += replaceStrs[c];
            } else {
                backendLevel += c;
            }
        }
        
        return backendLevel;
    };

    return { levelB2F, levelF2B };
};

/* ===== EXPORTS ===== */
export default LevelHelper;