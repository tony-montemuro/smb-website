import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SubmissionRead from "../../database/read/SubmissionRead";

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
    const { retrieveSubmissions, newQuery } = SubmissionRead();

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

        // get submissions, and filter based on the live field and the level.misc field. order by level id in ascending order
        const submissions = await retrieveSubmissions(abb, type, submissionState);
        const filteredSub = submissions.filter(row => row.live === true && row.level.misc === isMisc);
        filteredSub.sort((a, b) => a.level.id - b.level.id);

        // NEW - get submissions, and filter based on the live field and the level.misc field. order by level id in ascending order
        const newSubmissions = await newQuery(abb, type);
        const newFiltered = newSubmissions.filter(row => row.details.live && row.level.misc === isMisc);
        newFiltered.sort((a, b) => a.level.id - b.level.id);

        // construct base recordTable obj
        const modes = [...new Set(filteredLevels.map(level => level.mode))];
        const obj = {};
        modes.forEach(mode => {
            obj[mode] = [];
        });

        // NEW - construct base recordTable obj
        const newTable = {};
        modes.forEach(mode => newTable[mode] = []);

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

        // NEW - now, let's populate the table with records
        j = 0;
        filteredLevels.forEach(level => {
            // declare variables used to determine the record for each level
            const mode = level.mode, start = j, names = [];
            let record = -1;

            // loop through all submissions for the current level
            while (j < newFiltered.length && newFiltered[j].level.name === level.name) {
                if (newFiltered[j].details.record === newFiltered[start].details.record) {
                    const user = newFiltered[j].user;
                    record = newFiltered[j].details.record;
                    names.push({ username: user.username, id: user.id });
                }
                j++;
            }

            // if names is non-empty, this means their are one or more submissions for this level. we need to
            // format the record if the type is time
            if (names.length > 0) {
                record = type === "time" ? record.toFixed(2) : record;
            }

            // finally, update our table
            newTable[mode].push({
                level: level.name, 
                record: record === -1 ? '' : record, 
                name: names
            });
        });

        // finally, update react states
        setRecordTable(obj);
        setLoading(false);
        console.log(obj);

        // NEW - finally, update react states
        console.log(`${ type } RECORD TABLE GENERATED FROM NEW BACK-END:`);
        console.log(newTable);
    };

    return { 
        loading,
        game,
        recordTable, 
        setLoading,
        generateWorldRecords
    };
};

export default RecordsInit;