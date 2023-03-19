/* ===== IMPORTS ===== */
import { StaticCacheContext } from "../../Contexts";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import MedalsHelper from "../../helper/MedalsHelper";
import SubmissionRead from "../../database/read/SubmissionRead";

const Medals = () => {
    /* ===== CONTEXTS ===== */

    // static cache state from static cache context
    const { staticCache } = useContext(StaticCacheContext);

    /* ===== STATES ===== */
    const [game, setGame] = useState(undefined);
    const [medals, setMedals] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getUserMap, getMedalTable, insertPositionToMedals } = MedalsHelper();
    const { getSubmissions } = SubmissionRead();

    // navigate used for redirecting
    const navigate = useNavigate();

    // FUNCTION 1: validateMedalsPath - determine if path is valid for Medals component
    // PRECONDITIONS (1 parameter):
    // 1.) game: an object containing information about the game defined in the path
    // POSTCONDITIONS (1 returns):
    // 1.) error: a string that gives information as to why their is an issue with the path
    // if this string returns an undefined value, it means no errors were detected
    const validateMedalsPath = game => {
        // initialize error variable to null
        let error = undefined;

        // ensure the game is legitimate
        if (!game) {
            error = "Error: Invalid game.";
        }

        return error;
    };

    // FUNCTION 2: fetchGame - given an abb, find the corresponding game object
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it. abb is fetched from
    // the URL
    // POSTCONDITIONS (2 possible outcome):
    // 1.) abb does not correspond to a game. in this case, the function will handle this error, navigate
    // the user back to the home screen, and return early [this is usually due to a undefined URL path]. return false in this case.
    // 2.) abb does correspond to a game. in this game, we fetch the game object from cache, and call the setGame() function
    // to update the game state with the game object. return true in this case.
    const fetchGame = abb => {
        // first, validate the path
        const games = staticCache.games;
        const currentGame = games.find(row => row.abb === abb);
        const pathError = validateMedalsPath(currentGame);

        // if the game is not valid, let's navigate home and end the function
        if (pathError) {
            console.log(pathError);
            navigate("/");
            return false;
        }

        // update game state hook
        setGame(currentGame);
        return true;
    };

    // FUNCTION 3: generateMedalTable - given an array of submissions, create an array of medal table objects
    // PRECONDITIONS (1 parameter):
    // 1.) allSubmissions: an array containing unfiltered submissions for a particular game. the submissions must be
    // ordered by type in descending order, then by level id in ascending order
    // POSTCONDITIONS (1 possible outcome):
    // 1.) medalTable: an array of medal table objects is returned. the array is sorted as follows (descending): 
    // platinum, gold, silver, bronze.
    const generateMedalTable = allSubmissions => {
        // filter submissions by the details.live field
        const submissions = allSubmissions.filter(row => row.details.live);

        // given our array of submissions, create the medal table
        const userMap = getUserMap(submissions);
        const medalTable = getMedalTable(userMap, submissions);
        insertPositionToMedals(medalTable);

        return medalTable;
    }

    // FUNCTION 4: fetchMedals - given an abb and category, medal tables for both time and score are generated
    // PRECONDITIONS (3 parameter):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it. abb is fetched from
    // the URL
    // 2.) category: the current category, either "main" or "misc". category is fetched from the URL
    // 3.) submissionReducer: an object with two fields:
        // a.) reducer: the submission reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (1 possible outcome):
    // 1.) both the time and score medal tables are generated, and the setMedals() function is called
    // to update the medals state with the medalTable object. the medalTable object has two fields:
        // a.) score: this field stores the score medal table
        // b.) time: this field stores the time medal table
    const fetchMedals = async (abb, category, submissionReducer) => {
        // get all submissions, and filter based on the details.live field
        const [allScoreSubmissions, allTimeSubmissions] = await Promise.all(
            [
                getSubmissions(abb, category, "score", submissionReducer), 
                getSubmissions(abb, category, "time", submissionReducer)
            ]
        );
        
        // generate medal tables for both types
        const scoreMedalTable = generateMedalTable(allScoreSubmissions);
        const timeMedalTable = generateMedalTable(allTimeSubmissions);

        // create our final medal table object, and update the medals state
        const medalTable = { score: scoreMedalTable, time: timeMedalTable };
        setMedals(medalTable);
    };

    return { 
        game,
        medals,
        fetchGame,
        fetchMedals
    };
};

/* ===== EXPORTS ===== */
export default Medals;