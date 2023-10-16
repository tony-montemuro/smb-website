/* ===== IMPORTS ===== */
import { useState } from "react";

const StatsDirectory = () => {
    /* ===== STATES ===== */
    const [userGames, setUserGames] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: initUserGames - given a profile object, generate a new object which contains fields for
    // the main games they have submitted to (if any), and the custom games they have submitted to (if any)
    // PRECONDITIONS (1 parameter):
    // 1.) profile: a profile object, corresponding to the profile id in the url
    // POSTCONDITIONS (1 possible outcome):
    // since the `submitted_games` field in profile is an array of simplified game objects, we basically just need to split this array
    // into two arrays: split by "main" and "custom"
    const initUserGames = profile => {
        // split submissions based on 'custom' field
        const main = [], custom = [];
        profile.submitted_games.forEach(game => {
            game.custom ? custom.push(game) : main.push(game);
        });
        setUserGames({ main, custom });
    };

    return { userGames, initUserGames };
};

/* ===== EXPORTS ===== */
export default StatsDirectory;