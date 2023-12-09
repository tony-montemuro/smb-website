/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useReducer } from "react";
import GameRead from "../../database/read/GameRead";
import ProfileRead from "../../database/read/ProfileRead";

const RecentSubmissions = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== VARIABLES ===== */
    const defaultFiltersData = {
        categories: undefined,
        games: undefined,
        users: undefined
    };

    /* ===== REDUCER FUNCTIONS ===== */

    // FUNCTION 1: reducer - code that executes when user tries to dispatch the filtersData reducer
    // PRECONDITIONS (2 parameters):
    // 1.) the current state of `defaultFiltersData`
    // 2.) an object with two fields:
        // a.) type: a string that specifies which field to modify
        // b.) value: the value we want to update filtersData[type] to
    // POSTCONDITIONS (2 parameters):
    // if the type is one of the valid fields, we update that field's value with `action.value`
    // otherwise, this function does nothing (return state)
    const reducer = (state, action) => {
        const type = action.type;
        if (Object.keys(defaultFiltersData).includes(type)) {
            return { ...state, [type]: action.value };
        }
        return state;
    };

    /* ===== REDUCERS ===== */
    const [filtersData, dispatchFiltersData] = useReducer(reducer, defaultFiltersData);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryGameByList } = GameRead();
    const { queryProfileByList } = ProfileRead();

    // FUNCTION 1: fetchGames - function that fetches any games that we are already fitering by
    // PRECONDITIONS (1 parameter):
    // 1.) searchParams: a URLSearchParams object which defines the filters on the recent submissions
    // POSTCONDITIONS (3 possible outcomes):
    // if any games are being filtered in the search params, and the query is a success, this function updates the `games` state by calling
    // the `dispatchFiltersData` setter function
    // if any games are being filtered in the search params, and the query fails, this function will render an error message to the user,
    // and leave the component loading
    // if NO games are being filtered in the search params, this function will simply update the `games` state to an empty array by calling
    // the `dispatchFiltersData` setter function with an empty array argument
    const fetchGames = async searchParams => {
        // first, let's get all the games from the search params, if there are any
        const abbs = [];
        for (const [key, value] of searchParams) {
            if (key === "game_id") {
                abbs.push(value);
            }
        }

        // if there are any games in the search params, let's get all associated game objects, and update the games state
        let games = [];
        if (abbs.length > 0) {
            try {
                games = await queryGameByList(abbs);
            } catch (error) {
                addMessage("One or more filters has broken due loading failures.", "error", 7000);
                games = null;
            };
        }
        dispatchFiltersData({ type: "games", value: games });
    };

    // FUNCTION 2: fetchUsers - function that fetches any users that we are already fitering by
    // PRECONDITIONS (1 parameter):
    // 1.) searchParams: a URLSearchParams object which defines the filters on the recent submissions
    // POSTCONDITIONS (3 possible outcomes):
    // if any users are being filtered in the search params, and the query is a success, this function updates the `users` state by calling
    // the `dispatchFiltersData` setter function
    // if any users are being filtered in the search params, and the query fails, this function will render an error message to the user,
    // and leave the component loading
    // if NO users are being filtered in the search params, this function will simply update the `users` state to an empty array by calling
    // the `dispatchFiltersData` setter function with an empty array argument
    const fetchUsers = async searchParams => {
        // first, let's get all the users from the search params, if there are any
        const ids = [];
        for (const [key, value] of searchParams) {
            if (key === "profile_id") {
                ids.push(value);
            }
        }

        // if there are any users in the search params, let's get all associated profile objects, and update the users state
        let users = [];
        if (ids.length > 0) {
            try {
                users = await queryProfileByList(ids);
            } catch (error) {
                addMessage("One or more filters has broken due loading failures.", "error", 7000);
                users = null;
            };
        }
        dispatchFiltersData({ type: "users", value: users });
    };

    return { filtersData, dispatchFiltersData, fetchGames, fetchUsers };
};

/* ===== EXPORTS ===== */
export default RecentSubmissions;