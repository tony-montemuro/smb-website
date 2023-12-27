/* ===== IMPORTS ===== */
import FrontendHelper from "../../helper/FrontendHelper";

const FancyLevel = () => {
    /* ===== VARIABLES ===== */
    const goals = ["blue", "green", "red", "stunt"];

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { snakeToTitle } = FrontendHelper();

    // FUNCTION 1: cleanLevelName - code that takes the level in snake case, and converts it to a format the user is familiar with
    // PRECONDITIONS (1 parameter):
    // 1.) level: an unformatted level name
    // POSTCONDITIONS (1 possible outcome):
    // returns a copy of level in title case, as well as handling strange edge cases such as dashes, dots, etc.
    const cleanLevelName = level => {
        const specialChars = [".", "-", "("];
        const replace = { "~~": "?" };
        let cleanedLevel = snakeToTitle(level);
        for (let i = 0; i < cleanedLevel.length; i++) {
            if (i > 0 && specialChars.includes(cleanedLevel[i-1])) {
                const former = cleanedLevel.substr(0, i), later = cleanedLevel.substr(i+1);
                cleanedLevel = former + cleanedLevel[i].toUpperCase() + later;
            }
        }
        for (let [target, value] of Object.entries(replace)) {
            cleanedLevel = cleanedLevel.replaceAll(target, value);
        }
        return cleanedLevel;
    };

    // FUNCTION 2: addSyntaxToGoal - simple function that returns a goal string wrapped in snake case syntax
    // PRECONDITIONS (1 parameter):
    // 1.) goal: a string: "blue", "green", or "red"
    // POSTCONDITIONS (1 possible outcome):
    // the string is returned like so (ignore brackets): "_([goal])"
    const addSyntaxToGoal = goal => `_(${ goal })`;

    // FUNCTION 3: getNameAndGoal - function that returns the cleaned name of the level, as well as the goal-type, if there is one
    // PRECONDITIONS (1 parameter):
    // 1.) level: a string representing a level, in snake-case
    // POSTCONDITIONS (1 possible outcome):
    // an object with two fields is returned:
        // a.) levelName: the name of the level in title case
        // b.) goal: one of 4 values: "blue", "green", "red", or undefined
    const getNameAndGoal = level => {
        const goal = goals.find(goal => level.endsWith(addSyntaxToGoal(goal)));
        if (goal) level = level.replace(addSyntaxToGoal(goal), "");
        return { levelName: cleanLevelName(level), goal };
    };

    return { getNameAndGoal };
};

/* ===== EXPORTS ===== */
export default FancyLevel;