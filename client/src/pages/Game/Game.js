/* ===== IMPORTS ===== */
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Submission2Read from "../../database/read/Submission2Read";

const Game = () => {
    /* ===== VARIABLES ===== */
    const navigate = useNavigate();

    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryRecentSubmissions2 } = Submission2Read();
    
    // FUNCTION 1: getSubmissions - given an abb, get the 5 most recent submissions for that game, and update the submission state
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // POSTCONDITIONS (1 possible outcome):
    // query the recent submissions, and update the submissions state by calling the setSubmissions() function
    const getSubmissions = async abb => {
        const submissions = await queryRecentSubmissions2(abb);
        setSubmissions(submissions);
    };

    // FUNCTION 2: onLevelClick - function that is called when the user clicks a button to navigate to a levelboard
    // 1.) abb: a string representing the unique identifier for a game
    // 2.) category: a string representing a valid category
    // 3.) type: a string, either "score" or "time"
    // 4.) levelName: a string representing the name of a level belonging to abb's game
    // POSTCONDITIONS (1 possible outcome):
    // the user will be navigated to the levelboard according to the parameters passed to the function
    const onLevelClick = (abb, category, type, levelName) => {
        navigate(`/games/${ abb }/${ category }/${ type }/${ levelName }`);
    };

    return { submissions, getSubmissions, onLevelClick };
};

/* ===== EXPORTS ===== */
export default Game;