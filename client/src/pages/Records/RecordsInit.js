import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

const RecordsInit = () => {
    /* ===== VARIABLES ===== */
    const path = window.location.pathname;
	const pathArr = path.split("/");
    const abb = pathArr[2];
    const category = pathArr[3];
    const mode = pathArr[4];

    /* ===== STATES ===== */
    const [loading, setLoading] = useState(true);
    const [levels, setLevels] = useState([]);
    const [recordTable, setRecordTable] = useState({});
    const [game, setGame] = useState({ name: "", mode: "", abb: "" });

    /* ===== FUNCTIONS ===== */

    // navigate used for redirecting
    const navigate = useNavigate();

    // function that is called upon page load. query the levels table
    // for list of levels specified by the path
    const queryLevels = async() => {
        try {
            // first, query the levels table
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
            setGame({
                name: gameObj.name, 
                abb: gameObj.abb, 
                mode: mode,
                category: category
            });
            setLevels(levelList);
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

    // once levels have been loaded, we can construct record table. the
    // recordTable object has a field for each level. each field contains
    // the record information for that level (if there is one)
    const addWorldRecords = async() => {
        try {
            // query records table based on pathing
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

            // sort records array by level id, and construct base recordTable obj
            records.sort((a, b) => a.level.id - b.level.id);
            const modes = [...new Set(levels.map(level => level.mode.name))];
            const obj = {};
            modes.forEach(mode => {
                obj[mode] = [];
            });

            // now, let's populate obj
            let j = 0;
            for (let i = 0; i < levels.length; i++) {
                const currentLevel = levels[i].name, currentMode = levels[i].mode.name;
                const start = j;
                let record = -1;
                const names = [];
                while (j < records.length && records[j].level.name === currentLevel) {
                    if (records[j][mode] === records[start][mode]) {
                        const user = records[j].profiles;
                        record = records[j][mode];
                        names.push({ username: user.username, id: user.id });
                        // names += records[j].profiles.username + ", ";
                    }
                    j++;
                }
                if (names.length > 0) {
                    // names = names.slice(0, -2);
                    record = mode === "time" ? record.toFixed(2) : record;
                }
                obj[currentMode].push({
                    level: currentLevel, 
                    record: record === -1 ? '' : record, 
                    name: names
                });
            }

            // update react state hooks
            setRecordTable(obj);
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
        game,
        levels,
        recordTable, 
        queryLevels,
        addWorldRecords,
    };
};

export default RecordsInit;