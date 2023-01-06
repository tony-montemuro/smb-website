import { useState, useReducer } from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useNavigate } from "react-router-dom";
import MedalsHelper from "../../helper/MedalsHelper";
import TotalizerHelper from "../../helper/TotalizerHelper";

const UserStatsInit = () => {
    /* ===== VARIABLES ===== */
    const path = window.location.pathname;
    const pathArr = path.split("/");
    const userId = pathArr[2];
    const abb = pathArr[3];
    const category = pathArr[4];
    const navigate = useNavigate();

    /* ===== STATES & REDUCERS ===== */
    const [loading, setLoading] = useState(true);
    const [game, setGame] = useState(null);
    const [user, setUser] = useState(null);
    const [board, dispatchboard] = useReducer((state, action) => {
        return { ...state, [action.field]: action.data };
    }, { type: "score", score: null, time: null });

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { createTotalMaps, addPositionToTotals } = TotalizerHelper();
    const { createUserMap, createMedalTable, addPositionToMedals } = MedalsHelper();

    // function used to make sure a valid user is being viewed. if not, user will be redirected to home screen
    const checkForUser = async () => {
        try {
            // query for the user in the profiles table
            let { data: profile, error } = await supabase
                .from('profiles')
                .select('id, username, country, avatar_url')
                .eq("id", userId)
                .single();

            // if user is invalid, error will be thrown
            if (error) {
                throw error;
            }

            // if no error, update user hook
            setUser(profile);

        } catch (error) {
            // error code 22P02: userId is not in the uuid format, so it must be invalid
            // error code PGRST116: userId is not found in profiles table, so it must be invalid
            if (error.code === "22P02" || error.code === "PGRST116") {
                console.log("Error: Invalid user.");
                navigate("/");
            } else {
                console.log(error);
                alert(error.message);
            }
        }
    };

    // function that queries the list of levels for abb game. also separates each into score and time levels.
    // also used to calculate timeTotal, and validates the game
    const levelsQuery = async() => {
        try {
            // query level table for all levels in a particular game
            const isMisc = category === "misc" ? true : false;
            let { data: allLevels, error, status } = await supabase
                .from("level")
                .select("name, time, chart_type, mode (name, game (*))")
                .eq("game", abb)
                .eq("misc", isMisc)
                .order("id");

            // error handling
            if (error && status !== 406) {
                throw error;
            }
            if (allLevels.length === 0) {
                const error = { code: 1, message: "Error: Invalid game." };
                throw error;
            }

            // filter allLevels list into two levels: score and time
            const scoreLevels = allLevels.filter(level => level.chart_type === "score" || level.chart_type === "both");
            const timeLevels = allLevels.filter(level => level.chart_type === "time" || level.chart_type === "both");

            // now, calculate timeTotal from timeLevels array
            let timeTotal = 0;
            timeLevels.forEach(level => timeTotal += level.time);

            // update react hooks
            setGame({ 
                ...allLevels[0].mode.game, 
                category: category,
                score: scoreLevels,
                time: timeLevels,
                timeTotal: timeTotal
            });
            
        } catch(error) {
            if (error.code === 1) {
                console.log(error.message);
                navigate("/");
            } else {
                console.log(error);
                alert(error.message);
            }
        }
    }

    // function that queries the set of submissions based on the path, and calculates the following:
    // total {type}, medal count for {type}, and the record and position of each level in {type}
    const queryAndCalc = async (timeTotal) => {
        // initialize variables
        const type = timeTotal === undefined ? "score" : "time";
        const miscStatus = category === "misc" ? true : false;

        try {
            // query submissions table
            let { data: submissions, status, error } = await supabase
                .from(`${type}_submission`)
                .select(`
                    profiles:user_id ( id, username, country, avatar_url ),
                    level!inner (id, misc, name),
                    ${type},
                    live,
                    submitted_at
                `)
                .eq("game_id", abb)
                .eq("live", true)
                .eq("level.misc", miscStatus)
                .order(`${type}`, { ascending: false });

            // error check
            if (error && status !== 406) {
                throw error;
            }

            // first, let's start with totalizer
            const submissionCpy = [...submissions];
            const { liveTotalsMap } = createTotalMaps(submissions, miscStatus, type, timeTotal);

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
            submissions = submissionCpy;
            const userMap = createUserMap(submissions);
            const medalTable = createMedalTable(userMap, submissions, type);
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
            const modes = [...new Set(game[type].map(level => level.mode.name))];
            const rankings = {};
            modes.forEach(mode => {rankings[mode] = []});

            // get players ranking on each stage
            let j = 0;
            game[type].forEach(level => {
                const currentLevel = level.name, currentMode = level.mode.name;
                let record = -1, pos = -1, date = '';
                let trueCount = 1, posCount = trueCount;
                while (j < submissions.length && submissions[j].level.name === currentLevel) {
                    const submission = submissions[j];
                    if (submission.profiles.id === user.id) {
                        record = type === "time" ? submission[type].toFixed(2) : submission[type];
                        pos = posCount;
                        date = submission.submitted_at;
                    }
                    trueCount++;
                    if (j < submissions.length-1 && submissions[j+1][type] !== submission[type]) {
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
            dispatchboard({ field: type, data: info });

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    }

    return { 
        loading,
        game,
        user, 
        board,
        setLoading, 
        dispatchboard,
        checkForUser,
        levelsQuery,
        queryAndCalc 
    };
};

export default UserStatsInit;