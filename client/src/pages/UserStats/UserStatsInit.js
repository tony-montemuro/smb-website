import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import MedalsHelper from "../../helper/MedalsHelper";
import TotalizerHelper from "../../helper/TotalizerHelper";
import SubmissionRead from "../../database/read/SubmissionRead";
import UserStatsHelper from "../../helper/UserStatsHelper";

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
    const { getUserMap, getMedalTable, insertPositionToMedals } = MedalsHelper();
    const { getTotalMaps, sortTotals, insertPositionToTotals } = TotalizerHelper();
    const { getSubmissions } = SubmissionRead();
    const { validateUserStatsPath, getRankings } = UserStatsHelper();

    // function that generates { type } user statistics: totals, medals, and rankings
    const generateUserStats = async (type, profiles, games, allLevels, submissionReducer) => {
        // first, let's validate the path
        const currentUser = profiles.find(row => row.id === userId), currentGame = games.find(row => row.abb === abb);
        const pathError = validateUserStatsPath(currentGame, currentUser);
        if (pathError) {
            console.log(pathError);
            navigate("/");
            return;
        }

        // update user and game state hooks
        setUser(currentUser);
        setGame({
            ...currentGame,
            category: category
        });

        // next, get a list of filtered levels, and compute the totalTime
        const levels = allLevels.filter(row => row.game === abb && row.misc === isMisc && [type, "both"].includes(row.chart_type));
        let timeTotal = 0;
        if (type === "time") {
            levels.forEach(level => timeTotal += level.time);
        }

        // get submissions, and filter based on the level.misc field
        const allSubmissions = await getSubmissions(abb, category, type, submissionReducer);
        let submissions = allSubmissions.filter(row => row.details.live && row.level.misc === isMisc);

        // let's start with the totalizer
        const submissionsCpy = [...submissions];
        const { liveTotalsMap } = getTotalMaps(submissions, type, timeTotal);
        const { liveTotals } = sortTotals({}, liveTotalsMap, type);
        insertPositionToTotals(liveTotals, type);

        // now, we can filter the liveTotals array looking for the userId's object
        let total = liveTotals.find(obj => obj.user.id === userId);

        // now, it's time to do the medal table
        submissions = submissionsCpy;
        const userMap = getUserMap(submissions);
        const medalTable = getMedalTable(userMap, submissions);
        insertPositionToMedals(medalTable);

        // we can filter the medals array looking for the userId's object. handle if it's not found
        let medals = medalTable.find(obj => obj.user.id === userId);

        // now, it's time to do player rankings
        const rankings = getRankings(levels, submissions, userId);

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
        generateUserStats
    };
};

export default UserStatsInit;