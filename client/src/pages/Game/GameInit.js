import { useState } from 'react';
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
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
            obj[level.mode.name].push({ 
                id: level.name,
                chart_type: level.chart_type
            });
        });
        return obj;
    };

    // function that queries the list of levels to generate our levelModes objects
    const getLevels = async () => {
        try {
            // perform query
            let { data: lvls, error, status } = await supabase
                .from("level")
                .select(`
                    name, 
                    misc, 
                    mode (name, game (name, abb)),
                    chart_type
                `)
                .eq("game", abb)
                .order("id");

            // check for error
            if ((error && status !== 406) || lvls.length === 0) {
                throw error ? { code: 1, message: "Error: Invalid game." } : error
            }

            // first, update the game state
            const gameObj = lvls[0].mode.game;
            setGame({ name: gameObj.name, abb: gameObj.abb });

            // next, we need to split the levels based on whether they are misc or not
            const mainLevels = [], miscLevels = [];
            let mainModes = new Set(), miscModes = new Set();
            lvls.forEach(level => {
                if (level.misc) {
                    miscLevels.push(level);
                    miscModes.add(level.mode.name);
                } else {
                    mainLevels.push(level);
                    mainModes.add(level.mode.name);
                }
            });
            mainModes = [...mainModes];
            miscModes = [...miscModes];

            // next, let's create objects that divide the levels by modes
            const main = initLevelModeObj(mainModes, mainLevels);
            const misc = initLevelModeObj(miscModes, miscLevels);

            // finally, update react states
            setLevels({ main: main, misc: misc });
            setLoading(false); 
            console.log(main);
            console.log(misc);

        } catch(error) {
            if (error.code === 1) {
                console.log(error.message);
            } else {
                console.log(error);
                alert(error.message);
            }
            navigate("/");
        }
    };
    
    return { loading, game, levels, getLevels };
};

export default GameInit;