/* ===== IMPORTS ===== */
import { SubmissionContext } from "../../utils/Contexts";
import { useContext, useReducer, useState } from "react";

const SubmissionHandler = (isNew) => {
    /* ===== STATES ===== */
    const [game, setGame] = useState(undefined);
    const [checked, setChecked] = useState([]);

    /* ===== CONTEXTS ===== */

    // submissions state from submission context
    const { submissions } = useContext(SubmissionContext);

    /* ===== REDUCER FUNCTIONS ===== */

    // REDUCER FUNCTION 1: reducer - function that will be the reducer function for the recent reducer
    // PRECONDITIONS (2 parameters):
    // 1.) state: stores the information of the recent state stored in the reducer hook
    // 2.) action: an object that typically has two parameters:
        // a.) type: specifies what operations this function should perform
        // b.) payload: an object that stores information used in the operations
    // POSTCONDITIONS (3 possible outcomes):
    // if type is set, the function will return the payload, which defines the recent state
    // if type is delete, the function will remove a submission object based on payload values
    // if type is add, the function will add a submission object based on payload values
    const reducer = (state, action) => {
        switch (action.type) {
            // case 1: set - simply return the payload
            case "set": {
                return action.payload;
            }

            // case 2: delete - using the key and submission from the payload, remove a submission object, update the checked
            // array state, and return the updated state 
            case "delete": {
                // first, we add the submission object to the checked array
                const submission = action.payload;
                setChecked(oldChecked => [submission, ...oldChecked]);

                // then, we can update the recent state
                const id = submission.details.id, abb = submission.level.mode.game.abb;
                const newArr = state[abb].filter(row => row.details.id !== id);
                return {
                    ...state,
                    [abb]: newArr
                };
            }

            // case 3: add - using the key and id from the payload, add a submission object while maintaining the order of the
            // array, and return the updated state
            case "add": {
                // first, we remove the submission from the checked state
                const submission = action.payload;
                setChecked(oldChecked => oldChecked.filter(row => row !== submission));

                // then, we use the details from the submission to fetch a hard copy of the original submission found in the
                // submissionSet (set depends on the value of `isNew`)
                const id = submission.details.id, abb = submission.level.mode.game.abb;
                const submissionSet = isNew ? submissions.recent : submissions.reported;
                const originalSubmission = JSON.parse(JSON.stringify(submissionSet[abb].find(row => row.details.id === id)));

                // finally, we can update the recent state
                const newArr = [...state[abb], originalSubmission].sort((a, b) => {
                    return a.details.id.localeCompare(b.details.id);
                });
                return {
                    ...state,
                    [abb]: newArr
                };
            }

            // default case: simply return the state unchanged
            default: {
                return state;
            }
        };
    };

    /* ===== REDUCERS ===== */
    const [recent, dispatchRecent] = useReducer(reducer, undefined);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: setRecent - a wrapper function that will set the recent reducer
    // PRECONDITIONS (1 parameter):
    // 1.) recentSubmissions: an object containing keys for each game, and the value of each key being an array of all 
    // the recent submissions
    // POSTCONDITIONS (1 possible outcome):
    // a deep clone of recent is created, and the state of recent is updated using the dispatchRecent function
    const setRecent = recentSubmissions => {
        // create two deep copies
        const recentDeepCopy = JSON.parse(JSON.stringify(recentSubmissions));

        // update our recent reducer, as well as the recent copy
        dispatchRecent({ type: "set", payload: recentDeepCopy });
    };

    // FUNCTION 2: setDefaultGame - function that sets the game state hook using the setGame() function with a default value
    // PRECONDITIONS (1 parameter):
    // 1.) recent: an object with a key for each game, where the value of each key is an array of submission objects
    // POSTCONDITIONS (1 possible outcome):
    // the name of the game who has the most submissions is used as the argument for the setGame() function
    const setDefaultGame = recent => {
        // determine the game with the most submissions
        const game = Object.keys(recent)
            .reduce((a, b) => recent[a].length > recent[b].length ? a : b);

        // update the game state hooks with default value
        setGame(game);
    };

    // FUNCTION 3: addToRecent - a wrapper function that calls the recent dispatcher function to add a submission to
    // the recent reducer (and consequently, remove it from the checked array)
    // PRECONDITIONS (1 parameter):
    // 1.) submission: a submission object currently stored in the checked array, which should be transferred over to the recent
    // reducder
    // POSTCONDITIONS (1 possible outcome):
    // the reducer function is called, which does the bulk of the work. see the documentation for this function higher in this file
    const addToRecent = submission => {
        dispatchRecent({ type: "add", payload: submission });
    };

    return { game, recent, checked, setGame, dispatchRecent, setRecent, setDefaultGame, addToRecent };
};

/* ===== EXPORTS ===== */
export default SubmissionHandler;