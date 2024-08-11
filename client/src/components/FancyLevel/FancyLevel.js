/* ===== IMPORTS ===== */
import LevelHelper from "../../helper/LevelHelper.js";

const FancyLevel = () => {
    /* ===== VARIABLES & FUNCTIONS ===== */

    // helper variables & functions
    const { goals, levelB2F } = LevelHelper();

    // FUNCTION 1: addSyntaxToGoal - simple function that returns a goal string wrapped in snake case syntax
    // PRECONDITIONS (1 parameter):
    // 1.) goal: a string: "blue", "green", or "red"
    // POSTCONDITIONS (1 possible outcome):
    // the string is returned like so (ignore brackets): "_([goal])"
    const addSyntaxToGoal = goal => `_(${ goal })`;

    // FUNCTION 2: getNameAndGoal - function that returns the cleaned name of the level, as well as the goal-type, if there is one
    // PRECONDITIONS (1 parameter):
    // 1.) level: a string representing a level, in snake-case
    // POSTCONDITIONS (1 possible outcome):
    // an object with two fields is returned:
        // a.) levelName: the name of the level in title case
        // b.) goal: one of 4 values: "blue", "green", "red", or undefined
    const getNameAndGoal = level => {
        const goal = goals.find(goal => level.endsWith(addSyntaxToGoal(goal)));
        if (goal) level = level.replace(addSyntaxToGoal(goal), "");
        return { levelName: levelB2F(level), goal };
    };

    return { getNameAndGoal };
};

/* ===== EXPORTS ===== */
export default FancyLevel;