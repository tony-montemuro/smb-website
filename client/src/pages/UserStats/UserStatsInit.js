import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import MedalsHelper from "../../helper/MedalsHelper";
import TotalizerHelper from "../../helper/TotalizerHelper";
import SubmissionRead from "../../database/read/SubmissionRead";

const UserStatsInit = () => {
    /* ===== VARIABLES ===== */
    const path = window.location.pathname;
    const pathArr = path.split("/");
    const userId = pathArr[2];
    const abb = pathArr[3];
    const category = pathArr[4];
    const isMisc = category === "misc" ? true : false;
    const navigate = useNavigate();

    /* ===== STATES & REDUCERS ===== */
    const [loading, setLoading] = useState(true);
    const [game, setGame] = useState(null);
    const [user, setUser] = useState(null);
    const [board, dispatchBoard] = useReducer((state, action) => {
        return { ...state, [action.field]: action.data };
    }, { type: "score", score: null, time: null });

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { retrieveSubmissions, newQuery } = SubmissionRead();
    const { createTotalMaps, getTotalMaps, addPositionToTotals, insertPositionToTotals } = TotalizerHelper();
    const { createUserMap, getUserMap, createMedalTable, getMedalTable, addPositionToMedals, inserPositionToMedals } = MedalsHelper();

    // function that validates the path: checks the user and game. ALSO, this function filters the levels
    // of the game into two lists: score and time. the total time is calculated, and state hooks are updated
    const validatePath = (profiles, games, levels) => {
        // first, let's verify the path, starting with the user
        const currentUser = profiles.find(row => row.id === userId);
        if (!currentUser) {
            console.log("Error: Invalid user.");
            navigate("/");
            return;
        }

        // next, validate the game
        const currentGame = games.find(row => row.abb === abb);
        if (!currentGame) {
            console.log("Error: Invalid game.");
            navigate("/");
            return;
        }

        // next, filter levels, and split them based on their abb, misc, and type
        const gameLevels = levels.filter(row => row.game === abb && row.misc === isMisc);
        const scoreLevels = gameLevels.filter(row => ["score", "both"].includes(row.chart_type));
        const timeLevels = gameLevels.filter(row => ["time", "both"].includes(row.chart_type));
        let timeTotal = 0;
        timeLevels.forEach(level => timeTotal += level.time);

        // update user and game state hooks
        setUser(currentUser);
        setGame({
            ...currentGame,
            category: category,
            score: scoreLevels,
            time: timeLevels
        });

        return { scoreLevels, timeLevels, timeTotal };
    };

    // function that generates {type} user statistics: totals, medals, and rankings
    const generateUserStats = async (type, levels, submissionState, timeTotal) => {
        // get submissions, and filter based on the live and level.misc field
        const submissions = await retrieveSubmissions(abb, type, submissionState);
        let filtered = submissions.filter(row => row.live === true && row.level.misc === isMisc);

        // NEW - get submissions, and filter based on the live and level.misc field
        const newSubmissions = await newQuery(abb, type);
        let newFiltered = newSubmissions.filter(row => row.details.live && row.level.misc === isMisc);

        // first, let's start with totalizer
        const filteredCpy = [...filtered];
        const { liveTotalsMap } = createTotalMaps(filtered, isMisc, type, timeTotal);

        // NEW - first, let's start with the totalizer
        const newFilteredCpy = [...newFiltered];
        const { newLiveTotalsMap } = getTotalMaps(newFiltered, type, timeTotal);

        // sort the liveTotals array by total field
        let liveTotals = [];
        if (type === "score") {
            liveTotals = Object.values(liveTotalsMap).sort((a, b) => a.total > b.total ? -1 : 1);
        } else {
            liveTotals = Object.values(liveTotalsMap).sort((a, b) => b.total > a.total ? -1 : 1);
        }
        addPositionToTotals(liveTotals, type === "time" ? true : false);

        // NEW - sort the liveTotals array by total field
        let newLiveTotals = [];
        if (type === "score") {
            newLiveTotals = Object.values(newLiveTotalsMap).sort((a, b) => a.total > b.total ? -1 : 1);
        } else {
            newLiveTotals = Object.values(newLiveTotalsMap).sort((a, b) => b.total > a.total ? -1 : 1);
        }
        insertPositionToTotals(newLiveTotals, type);


        // now, we can filter the liveTotals array looking for the userId's object. handle if it's not found
        let total = liveTotals.filter(obj => obj.user_id === userId);
        if (total.length > 0) {
            total = total[0];
            total["hasData"] = true;
        } else {
            total = { hasData: false };
        }

        // NEW - now, we can filter the liveTotals array looking for the userId's object. handle if it's not found
        let newTotal = newLiveTotals.filter(obj => obj.user_id === userId);
        if (newTotal.length > 0) {
            newTotal = newTotal[0];
            newTotal["hasData"] = true;
        } else {
            newTotal = { hasData: false };
        }

        // now, it's time to do medal table. 
        filtered = filteredCpy;
        const userMap = createUserMap(filtered);
        const medalTable = createMedalTable(userMap, filtered, type);
        addPositionToMedals(medalTable);

        // NEW - now, it's time to do the medal table
        newFiltered = newFilteredCpy;
        const newUserMap = getUserMap(newFiltered);
        const newMedalTable = getMedalTable(newUserMap, newFiltered);
        inserPositionToMedals(newMedalTable);
        newFiltered.sort((a, b) => b.level.id > a.level.id ? -1 : 1);

        // now, we can filter the medals array looking for the userId's object. handle if it's not found
        let medals = medalTable.filter(obj => obj.user_id === userId);
        if (medals.length > 0) {
            medals = medals[0];
            medals["hasData"] = true;
        } else {
            medals = { hasData: false };
        }

        // NEW - now, we can filter the medals array looking for the userId's object. handle if it's not found
        let newMedals = newMedalTable.filter(obj => obj.user.id === userId);
        if (newMedals.length > 0) {
            newMedals = newMedals[0];
            newMedals["hasData"] = true;
        } else {
            newMedals = { hasData: false };
        }

        // now, it's time to do player rankings
        const modes = [...new Set(levels.map(level => level.mode))];
        const rankings = {};
        modes.forEach(mode => {rankings[mode] = []});

        // NEW - now, it's time to do player rankings
        const newModes = [...new Set(levels.map(level => level.mode))];
        const newRankings = {};
        newModes.forEach(mode => { newRankings[mode] = [] });

        // get players ranking on each stage
        let j = 0;
        console.log(filtered);
        levels.forEach(level => {
            const currentLevel = level.name, currentMode = level.mode;
            let record = -1, pos = -1, date = '';
            let trueCount = 1, posCount = trueCount;
            while (j < filtered.length && filtered[j].level.name === currentLevel) {
                const submission = filtered[j];
                if (submission.profiles.id === userId) {
                    record = type === "time" ? submission[type].toFixed(2) : submission[type];
                    pos = posCount;
                    date = submission.submitted_at;
                }
                trueCount++;
                if (j < filtered.length-1 && filtered[j+1][type] !== submission[type]) {
                    posCount = trueCount;
                }
                j++;
            }
            rankings[currentMode].push({
                level: currentLevel,
                record: record === -1 ? '' : record,
                date: date ? date.slice(0, 10) : date,
                position: pos === -1 ? '' : pos
            });
        });

        // NEW - get players ranking on each stage
        j = 0;
        levels.forEach(level => {
            const currentLevel = level.name, currentMode = level.mode;
            let record = -1, pos = -1, date = '';
            let trueCount = 1, posCount = trueCount;
            while (j < newFiltered.length && newFiltered[j].level.name === currentLevel) {
                const submission = newFiltered[j];
                if (submission.user.id === userId) {
                    record = type === "time" ? submission.details.record.toFixed(2) : submission.details.record;
                    pos = posCount;
                    date = submission.details.submitted_at;
                }
                trueCount++;
                if (j < newFiltered.length-1 && newFiltered[j+1].details.record !== submission.details.record) {
                    posCount = trueCount;
                }
                j++;
            }
            newRankings[currentMode].push({
                level: currentLevel,
                record: record === -1 ? '' : record,
                date: date ? date.slice(0, 10) : date,
                position: pos === -1 ? '' : pos
            });
        });

        // finally, update react hooks
        const info = {
            medals: medals,
            total: total,
            rankings: rankings
        };
        dispatchBoard({ field: type, data: info });

        // NEW - finally, update react hooks
        console.log(`${ type } USER STATS GENERATED FROM NEW BACK-END:`);
        console.log({ medals: newMedals, total: newTotal, rankings: newRankings });
    };

    return { 
        loading,
        game,
        user, 
        board,
        setLoading, 
        dispatchBoard,
        validatePath,
        generateUserStats
    };
};

export default UserStatsInit;