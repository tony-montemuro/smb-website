/* ===== IMPORTS ===== */
import { MessageContext, UserContext } from "../../utils/Contexts";
import { useContext, useReducer } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RPCRead from "../../database/read/RPCRead";

const ModeratorLayout = () => {
    /* ===== VARIABLES ===== */
    const pageType = useLocation().pathname.split("/")[2];
    const navigate = useNavigate();

    /* ===== REDUCER FUNCTIONS ===== */

    // FUNCTION 1: reducer - function that is executed when the user tries to update the games reducer hook
    // PRECONDITIONS (2 parameters):
    // 1.) state: the state of the current object (an array of games)
    // 2.) action: an object with two fields:
        // a.) type: specifies what action the reducer should take
        // b.) value: specifies the new value that the reducer should use
    // POSTCONDITIONS (4 possible outcomes):
    // if the type is `all`, the entire state is updated
    // if the type is `decrementUnapproved`, a single game's unapproved count is decremented by 1
    // if the type is `decrementReported`, a single game's reported count is decremented by 1
    // if the type is neither, this function does nothing
    const reducer = (state, action) => {
        const type = action.type;
        let abb, index, decremented;
        switch (type) {
            case "all":
                return action.value;

            case "decrementUnapproved":
                // initialize variables used to decrement
                abb = action.value;
                index = state.findIndex(game => game.abb === abb);

                // check if game exists in list. if not, do not change state
                if (index === -1) {
                    return state;
                }

                // finally, let's update the state
                decremented = { ...state[index], unapproved: state[index].unapproved-1 };
                return [...state.slice(0, index), decremented, ...state.slice(index+1)];

            case "decrementReported":
                // initialize variables used to decrement
                abb = action.value;
                index = state.findIndex(game => game.abb === abb);

                // check if game exists in list. if not, do not change
                if (index === -1) {
                    return state;
                }

                // finally, let's update the state
                decremented = { ...state[index], reported: state[index].reported-1 };
                return [...state.slice(0, index), decremented, ...state.slice(index+1)];

            default: 
                return state;
        };
    };
 
    /* ===== STATES & REDUCERS ===== */
    const [games, dispatchGames] = useReducer(reducer, undefined);

    /* ===== CONTEXTS ===== */

    // addMessage function from message context
    const { addMessage } = useContext(MessageContext);

    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { getUnapprovedCounts } = RPCRead();

    // FUNCTION 1: updateLayout - code that is executed when the ModeratorLayout component mounts, to fetch game & submission counts
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query successfully returns the data, we can update the `games` state by calling the `dispatchGames()` setter function 
    // if the query is a failure, render an error message to the user, and update the `games` state to an empty array
    const updateLayout = async () => {
        try {
            const filteredGames = !user.profile.administrator ? user.profile.game.map(game => game.abb) : [];
            const games = await getUnapprovedCounts(filteredGames);
            dispatchGames({ type: "all", value: games });
        } catch (error) {
            addMessage("Failed to load game metadata.", "error");
            dispatchGames({ type: "all", value: [] });
        };
    };

    // FUNCTION 2: handleTabClick - code that is executed when a moderator layout tab is selected
    // PRECONDITIONS (1 parameter):
	// 1.) otherPageType: a string, either "approvals", "reports", "post", or undefined
	// POSTCONDITIONS (2 possible outcome):
	// if otherPageType and pageType are the same, this function does nothing
	// otherwise, the user is navigated to the other page
	const handleTabClick = otherPageType => {
		if (otherPageType !== pageType) {
			otherPageType ? navigate(`/moderator/${ otherPageType }`) : navigate("/moderator");
		}
	};

    // FUNCTION 3: getNumberOfSubmissions - function that returns the number of submissions in the games object
    // PRECONDITIONS (1 parameter):
    // 1.) isUnapproved: a boolean function that will determine which set of submissions to count: unapproved or reported
    // POSTCONDITIONS (2 possible outcomes):
    // if games is undefined, this function will simply return 0
    // otherwise, each submission is tallied up, and the total number is returned
    const getNumberOfSubmissions = isUnapproved => {
        // if games is undefined, just return 0
        if (!games) {
            return 0;
        }

        // otherwise, count up all the submissions into a counter, and return that value
        let counter = 0;
        games.forEach(game => {
            counter += isUnapproved ? game.unapproved : game.reported;
        });
        return counter;
    };

    return { games, dispatchGames, updateLayout, handleTabClick, getNumberOfSubmissions };
};

/* ===== EXPORTS ===== */
export default ModeratorLayout;