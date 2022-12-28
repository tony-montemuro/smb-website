import { useState } from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useNavigate } from "react-router-dom";

const RecordsInit = () => {
    // variables
    const path = window.location.pathname;
	const pathArr = path.split("/");
    const abb = pathArr[2];
    const category = pathArr[3];
    const mode = pathArr[4];

    // states
    const [loading, setLoading] = useState(true);
    const [levels, setLevels] = useState([]);
    const [levelModes, setLevelModes] = useState({});
    const [game, setGame] = useState({});

    // navigate used for redirecting
    const navigate = useNavigate();

    const queryModeLevels = async() => {
        try {
            // next, query the levels table
            const isMisc = category === "misc" ? true : false;
            const { data: levelList, error, status } = await supabase
                .from("level")
                .select("name, mode (name, game (name, abb))")
                .eq("game", abb)
                .eq("misc", isMisc)
                .in("chart_type", ["both", `${mode}`])
                .order("id");

            // error handling
            if (error && status !== 406) {
                throw error;
            }
            if (levelList.length === 0) {
                const error = { code: 1, message: "Error: Invalid game." };
                throw error;
            }

            // update react state hook
            const gameObj = levelList[0].mode.game;
            setLevels(levelList);
            setGame({
                name: gameObj.name, 
                abb: gameObj.abb, 
                mode: mode,
                category: category
            });
            console.log(levelList);
            
        } catch(error) {
            if (error.code === 1) {
                console.log(error.message);
                navigate("/");
            } else {
                console.log(error);
                alert(error.message);
            }
        }
    };

    const addWorldRecords = async() => {
        try {
            const isMisc = category === "misc" ? true : false;
            const { data: records, error, status } = await supabase
                .from(`${mode}_submission`)
                .select(`
                    profiles:user_id (id, username),
                    ${mode},
                    submitted_at,
                    level!inner (id, misc, name)
                `)
                .eq("game_id", abb)
                .eq("live", true)
                .eq("level.misc", isMisc)
                .order(`${mode}`, { ascending: false })
                .order("submitted_at");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // sort records array by level id, and construct base levelModes obj
            records.sort((a, b) => a.level.id - b.level.id);
            const modes = [...new Set(levels.map(level => level.mode.name))];
            const obj = { modes: modes };
            modes.forEach(mode => {
                obj[mode] = [];
            });

            // now, let's populate obj
            let j = 0;
            for (let i = 0; i < levels.length; i++) {
                const currentLevel = levels[i].name, currentMode = levels[i].mode.name;
                const start = j;
                let record = -1, names = '';
                while (j < records.length && records[j].level.name === currentLevel) {
                    if (records[j][mode] === records[start][mode]) {
                        record = records[j][mode];
                        names += records[j].profiles.username + ", ";
                    }
                    j++;
                }
                if (names) {
                    names = names.slice(0, -2);
                    record = mode === "time" ? record.toFixed(2) : record;
                }
                obj[currentMode].push({
                    level: currentLevel, 
                    record: record === -1 ? '' : record, 
                    names: names
                });
            }

            // update react state hooks
            setLevelModes(obj);
            setLoading(false);
            console.log(records);
            console.log(obj);
        } catch(error) {
            console.log(error);
            alert(error.message);
        }
    };

    return { 
        loading,
        levels,
        levelModes, 
        game,
        queryModeLevels,
        addWorldRecords,
    };
};

export default RecordsInit;