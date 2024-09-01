/* ===== IMPORTS ===== */
import { AppDataContext } from "../../utils/Contexts.js";
import { useContext } from "react";
import LevelHelper from "../../helper/LevelHelper.js";

const FancyLevel = () => {
    /* ===== CONTEXTS ===== */
    const { appData } = useContext(AppDataContext); 

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { levelB2F, addSyntaxToGoal } = LevelHelper();

    // FUNCTION 1: getNameAndGoal - function that returns the cleaned name of the level, as well as the goal color, if there is one
    // PRECONDITIONS (1 parameter):
    // 1.) level: a string representing a level, in snake-case
    // POSTCONDITIONS (1 possible outcome):
    // an object with two fields is returned:
        // a.) levelName: the name of the level in title case
        // b.) goal: a goal object, consisting of an id, name, & color
    const getNameAndGoal = level => {
        const goal = appData.goals.find(goal => level.endsWith(addSyntaxToGoal(goal.name)));
        if (goal) level = level.replace(addSyntaxToGoal(goal.name), "");
        return { levelName: levelB2F(level), goal };
    };

    return { getNameAndGoal };
};

/* ===== EXPORTS ===== */
export default FancyLevel;