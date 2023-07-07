/* ===== IMPORTS ===== */
import { useReducer, useState } from "react";

const Approvals = () => {
    /* ===== REDUCER FUNCTIONS ===== */

    // REDUCER FUNCTION 1: reducer - function that will be the reducer function for the recent reducer
    // PRECONDITIONS (2 parameters):
    // 1.) state: stores the information of the recent state stored in the reducer hook
    // 2.) action: an object that typically has two parameters:
        // a.) type: specifies what operations this function should perform
        // b.) payload: an object that stores information used in the operations
    // POSTCONDITIONS (3 possible outcomes):
    // if type is set, the function will return the payload, which defines the recent state
    // if type is remove, the function will remove a submission object based on payload values
    // if type is add, the function will add a submission object based on payload values
    const reducer = (state, action) => {
        switch (action.type) {
            // case 1: set - simply return the payload
            case "set": {
                return action.payload;
            }

            // case 2: remove - using the key and id from the payload, remove a submission object, and return the updated state 
            case "remove": {
                const { key, id } = action.payload;
                const newArr = state[key].filter(submission => submission.details.id !== id);
                return {
                    ...state,
                    [key]: newArr
                };
            }

            // case 3: add - using the key and id from the payload, add a submission object while maintaining the order of the
            // array, and return the updated state
            case "add": {
                const { key, submission } = action.payload;
                const newArr = [...state[key], submission].sort((a, b) => {
                    return a.details.id.localeCompare(b.details.id);
                });
                return {
                    ...state,
                    [key]: newArr
                };
            }

            // default case: simply return the state unchanged
            default: {
                return state;
            }
        };
    };

    /* ===== STATES ===== */
    const [game, setGame] = useState(undefined);
    const [recent, dispatchRecent] = useReducer(reducer, undefined);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: setRecent - a wrapper function that will set the recent reducer
    // PRECONDITIONS (1 parameter):
    // 1.) recentSubmissions: an object containing keys for each game, and the value of each key being an array of all 
    // the recent submissions
    // POSTCONDITIONS (1 possible outcome):
    // a deep clone of recent is created, and the state of recent is updated using the dispatchRecent function
    const setRecent = recentSubmissions => {
        // create a deep copy
        const recentDeepCopy = JSON.parse(JSON.stringify(recentSubmissions));

        // update our recent reducer
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

    return { game, recent, setGame, setRecent, setDefaultGame };
};

/* ===== EXPORTS ===== */
export default Approvals;