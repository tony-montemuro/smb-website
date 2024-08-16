/* ===== IMPORTS ===== */
import { isUpperAlphaPattern } from "../utils/RegexPatterns.js";
import FrontendHelper from "./FrontendHelper.js";

const LevelHelper = () => {
    /* ===== FUNCTIONS ===== */

    // helper functions
    const { capitalize, snakeToTitle } = FrontendHelper();

    // FUNCTION 1: levelB2F ("level backend to frontend") - code that takes the level in snake case, and converts it to 
    // a format the user is familiar with
    // PRECONDITIONS (1 parameter):
    // 1.) level: an unformatted level name
    // POSTCONDITIONS (1 possible outcome):
    // returns a copy of level in title case, as well as handling strange edge cases such as dashes, dots, etc.
    const levelB2F = level => {
        const specialChars = [".", "-", "("];
        let cleanedLevel = snakeToTitle(level);

        // handle special characters
        for (let i = 0; i < cleanedLevel.length; i++) {
            if (i > 0 && specialChars.includes(cleanedLevel[i-1])) {
                const former = cleanedLevel.substr(0, i), later = cleanedLevel.substr(i+1);
                cleanedLevel = former + cleanedLevel[i].toUpperCase() + later;
            }
        }
        
        return decodeURIComponent(cleanedLevel);
    };

    // FUNCTION 2: levelB2F ("level back to front") - function that converts a level in frontend format to backend format
    // PRECONDITIONS (1 parameter):
    // 1.) level: a string representing a level name, in title case, which the user is familiar with
    // POSTCONDITIONS (1 possible outcome):
    // the level is converted to a format familiar to the DB
    const levelF2B = level => {
        const separators = [".", "-", "(", "_", "__"];
        let backendLevel = "";
        let word = "";

        level = level.replaceAll("_", "__").replaceAll(" ", "_");
        level = encodeURIComponent(level);
        
        for (let i = 0; i < level.length; i++) {
            let c = level[i];

            // if the word includes any uppercase letters after beginning, implication is that user wants non-standard 
            // capitalization. the convention in DB is that first character is also capitalized, although technically unnecessary
            if (word.length === 0) {
                c = c.toLowerCase();
            } else if (isUpperAlphaPattern.test(c)) {
                word = capitalize(word);
            }

            // finally, update word with c. if c is a "separator" character, let's update `backendLevel`
            word += c;
            if (separators.includes(c)) {
                backendLevel += word;
                word = "";
            }
        }
        backendLevel += word;
        
        return backendLevel;
    };

    return { levelB2F, levelF2B };
};

/* ===== EXPORTS ===== */
export default LevelHelper;