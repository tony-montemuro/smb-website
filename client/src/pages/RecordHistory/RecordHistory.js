/* ===== IMPORTS ===== */
import { useState } from "react"; 
import RecordHistoryRead from "../../database/read/RecordHistoryRead";

const RecordHistory = () => {
    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryFilteredSubmissions } = RecordHistoryRead();

    // FUNCTION 1: getSubmissions - given the abb, levelName, userId, and type from path, get the list of submissions from the database
    // PRECONDITIONS (4 parameters):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // 2.) levelName: a string value, representing the name of a level.
    // 3.) userId: a string value, representing a user's uuid value. this is used to uniquely identify a user.
    // 4.) type: a string value, either "score" or "time"
    // POSTCONDITIONS (1 possible outcome):
    // given our parameters, we get a filtered list of submissions from the database, and update the submissions state by calling the
    // setSubmissions() function
    const getSubmissions = async (abb, levelName, userId, type) => {
        const isScore = type === "score" ? true : false;
        const submissions = await queryFilteredSubmissions(abb, levelName, userId, isScore);
        setSubmissions(submissions);
    };

    return { submissions, getSubmissions };
};

/* ===== EXPORTS ===== */
export default RecordHistory;