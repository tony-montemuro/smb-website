import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import MedalsHelper from "../../helper/MedalsHelper";
import TotalizerHelper from "../../helper/TotalizerHelper";
import SubmissionQuery from "../../helper/SubmissionQuery";

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
    const { createTotalMaps, addPositionToTotals } = TotalizerHelper();
    const { createUserMap, createMedalTable, addPositionToMedals } = MedalsHelper();
    const { query } = SubmissionQuery();

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
        // first, we have two cases. if user is accessing already cached submissions, we can fetch
        // this information from submissionState. Otherwise, we need to query, and set the submission state
        let submissions = {};
        if (submissionState.state && abb in submissionState.state) {
            submissions = submissionState.state[abb];
        } else {
            submissions = await query(abb, type);
            submissionState.setState({ ...submissionState.state, [abb]: submissions });
        }

        // now, filter the submissions by the live and level.misc fields
        let filtered = submissions.filter(row => row.live === true && row.level.misc === isMisc);

        // first, let's start with totalizer
        const filteredCpy = [...filtered];
        const { liveTotalsMap } = createTotalMaps(filtered, isMisc, type, timeTotal);

        // sort the liveTotals array by total field
        let liveTotals = [];
        if (type === "score") {
            liveTotals = Object.values(liveTotalsMap).sort((a, b) => a.total > b.total ? -1 : 1);
        } else {
            liveTotals = Object.values(liveTotalsMap).sort((a, b) => b.total > a.total ? -1 : 1);
        }
        addPositionToTotals(liveTotals, type === "time" ? true : false);

        // now, we can filter the liveTotals array looking for the userId's object. handle if it's not found
        let total = liveTotals.filter(obj => obj.user_id === userId);
        if (total.length > 0) {
            total = total[0];
            total["hasData"] = true;
        } else {
            total = { hasData: false };
        }

        // now, it's time to do medal table. 
        filtered = filteredCpy;
        const userMap = createUserMap(filtered);
        const medalTable = createMedalTable(userMap, filtered, type);
        addPositionToMedals(medalTable);

        // now, we can filter the medals array looking for the userId's object. handle if it's not found
        let medals = medalTable.filter(obj => obj.user_id === userId);
        if (medals.length > 0) {
            medals = medals[0];
            medals["hasData"] = true;
        } else {
            medals = { hasData: false };
        }

        // now, it's time to do player rankings
        const modes = [...new Set(levels.map(level => level.mode))];
        const rankings = {};
        modes.forEach(mode => {rankings[mode] = []});

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

        // finally, update react hooks
        const info = {
            medals: medals,
            total: total,
            rankings: rankings
        };
        dispatchBoard({ field: type, data: info });
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