import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GameInit = () => {
    /* ===== VARIABLES ===== */
    const path = window.location.pathname;
    const abb = path.split("/")[2];

    /* ===== STATES ===== */
    const [loading, setLoading] = useState(true);
    const [levels, setLevels] = useState({ main: null, misc: null });
    const [game, setGame] = useState({ name: "" });

    /* ===== FUNCTIONS ===== */

    // navigate variable used to navigate to home screen if error is detected
    const navigate = useNavigate();

    // function that initializes an object with empty arrays based on
    // the names of the strings, and then fills each array with levels with
    // the corresponding modes. returns object.
    const initLevelModeObj = (modes, levels) => {
        // first, initialize object
        const obj = {};
        modes.forEach(mode => {
            obj[mode] = [];
        });

        // now, fill it, and return
        levels.forEach(level => {
            obj[level.mode].push({ 
                id: level.name,
                chart_type: level.chart_type
            });
        });
        return obj;
    };

    // function that verfies the path, sets game state, and sets level state
    const splitLevels = (games, levelList) => {
        // first, check the path
        const currentGame = games.find(game => game.abb === abb);

        // if the currentGame was found, the find method will return a non-undefined object
        if (currentGame) {
            // first, split levels based on whether they are misc or not
            const filteredLevels = levelList.filter(level => level.game === abb);
            const mainLevels = [], miscLevels = [];
            let mainModes = new Set(), miscModes = new Set();
            filteredLevels.forEach(level => {
                if (level.misc) {
                    miscLevels.push(level);
                    miscModes.add(level.mode);
                } else {
                    mainLevels.push(level);
                    mainModes.add(level.mode);
                }
            });
            mainModes = [...mainModes];
            miscModes = [...miscModes];

            // next, let's create objects that divide the levels by modes
            const main = initLevelModeObj(mainModes, mainLevels);
            const misc = initLevelModeObj(miscModes, miscLevels);

            // finally, update react states
            setGame(currentGame);
            setLevels({ main: main, misc: misc });
            setLoading(false);
            console.log(main);
            console.log(misc);

        } else {
            // if game was not found, return to home screen
            console.log("Error: Invalid game.");
            navigate("/");
        }
    };
    
    return { loading, game, levels, splitLevels };
};

export default GameInit;