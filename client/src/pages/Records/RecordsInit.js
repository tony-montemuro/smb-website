import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SubmissionQuery from "../../helper/SubmissionQuery";

const RecordsInit = () => {
    /* ===== VARIABLES ===== */
    const path = window.location.pathname;
	const pathArr = path.split("/");
    const abb = pathArr[2];
    const category = pathArr[3];
    const type = pathArr[4];
    const isMisc = category === "misc" ? true : false;

    /* ===== STATES ===== */
    const [loading, setLoading] = useState(true);
    const [recordTable, setRecordTable] = useState({});
    const [game, setGame] = useState({ name: "", type: "", abb: "", other: "", isMisc: false });

    /* ===== FUNCTIONS ===== */

    // navigate used for redirecting
    const navigate = useNavigate();

    // helper functions
    const { query } = SubmissionQuery();

    // function that verifies the path, and also computes the records for each stage
    const generateWorldRecords = async (games, levels, submissionState) => {
        // first, check the path
        const currentGame = games.find(game => game.abb === abb);

        // if the game is not valid, let's navigate home and end the function
        if (!currentGame) {
            console.log("Error: Invalid game.");
            navigate("/");
            return;
        }

        // set game state hook, and filter levels list by game, misc and chart_type
        setGame({ ...currentGame, type: type, isMisc: isMisc, category: category, other: type === "score" ? "time" : "score" });
        const filteredLevels = levels.filter(row => row.game === abb && row.misc === isMisc && [`${type}`, "both"].includes(row.chart_type));

        // from here, we have two cases. if user is accessing already cached submissions, we can fetch
        // this information from submissionState. Otherwise, we need to query, and set the submission state
        let submissions = {};
        if (submissionState.state && abb in submissionState.state) {
            submissions = submissionState.state[abb];
        } else {
            submissions = await query(abb, type);
            submissionState.setState({ ...submissionState.state, [abb]: submissions });
        }

        // filter array of submissions by live and level.misc, and sort by level id
        const filteredSub = submissions.filter(row => row.live === true && row.level.misc === isMisc);
        filteredSub.sort((a, b) => a.level.id - b.level.id);

        // construct base recordTable obj
        const modes = [...new Set(filteredLevels.map(level => level.mode))];
        const obj = {};
        modes.forEach(mode => {
            obj[mode] = [];
        });

        // now, let's populate obj
        let j = 0;
        for (let i = 0; i < filteredLevels.length; i++) {
            const currentLevel = filteredLevels[i].name, currentMode = filteredLevels[i].mode;
            const start = j;
            let record = -1;
            const names = [];
            while (j < filteredSub.length && filteredSub[j].level.name === currentLevel) {
                if (filteredSub[j][type] === filteredSub[start][type]) {
                    const user = filteredSub[j].profiles;
                    record = filteredSub[j][type];
                    names.push({ username: user.username, id: user.id });
                }
                j++;
            }
            if (names.length > 0) {
                record = type === "time" ? record.toFixed(2) : record;
            }
            obj[currentMode].push({
                level: currentLevel, 
                record: record === -1 ? '' : record, 
                name: names
            });
        }

        // finally, update react states
        setRecordTable(obj);
        setLoading(false);
        console.log(obj);
    };

    return { 
        loading,
        game,
        recordTable, 
        generateWorldRecords
    };
};

export default RecordsInit;