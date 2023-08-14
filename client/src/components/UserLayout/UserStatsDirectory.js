/* ===== IMPORTS ===== */
import { useState } from "react";

const UserStatsDirectory = () => {
    /* ===== STATES ===== */
    const [userGames, setUserGames] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: initUserGames - given an array of games, and a user profile, generate a new object which contains fields for
    // the main games they have submitted to (if any), and the custom games they have submitted to (if any)
    // PRECONDITIONS (2 parameters):
    // 1.) games: an array of game objects, which comes from the static cache
    // 2.) profile: a profile object, corresponding to the profile id in the url
    // POSTCONDITIONS (1 possible outcome):
    // since the `submitted_games` field in profile is an array of strings that represent the game abb, we basically need to map
    // each abb to a game object. we do this, and store the result in the userGames state by calling the setUserGames() function
    const initUserGames = (games, profile) => {
        // first, let's generate our main and custom arrays
        const main = [], custom = [];
        const userGameAbbs = profile.submitted_games ? profile.submitted_games : [];
        userGameAbbs.forEach(abb => {
            const game = games.find(game => game.abb === abb);
            game.custom ? custom.push(game) : main.push(game);
        });

        // next, let's define the object that will contain the user games
        const userGames = {};
        if (main.length > 0) {
            userGames.main = main;
        }
        if (custom.length > 0) {
            userGames.custom = custom;
        }

        // finally, update the userGames state by calling the setUserGames() function
        setUserGames(userGames);
    };

    return { userGames, initUserGames };
};

/* ===== EXPORTS ===== */
export default UserStatsDirectory;