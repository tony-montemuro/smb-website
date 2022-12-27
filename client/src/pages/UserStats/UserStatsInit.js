import { useState } from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useNavigate } from "react-router-dom";
import TotalizerHelper from "../../helper/TotalizerHelper";
import MedalsHelper from "../../helper/MedalsHelper";

const UserStatsInit = () => {
    // variables
    const path = window.location.pathname;
    const pathArr = path.split("/");
    const userId = pathArr[2];
    const abb = pathArr[3];
    const category = pathArr[4];
    const navigate = useNavigate();

    // states
    const [loading, setLoading] = useState(true);
    const [loadingScore, setLoadingScore] = useState(true);
    const [loadingTime, setLoadingTime] = useState(true);
    const [game, setGame] = useState(null);
    const [totalTime, setTotalTime] = useState(null);
    const [user, setUser] = useState(null);
    const [scoreTotal, setScoreTotal] = useState(null);
    const [scoreMedals, setScoreMedals] = useState(null);
    const [timeTotal, setTimeTotal] = useState(null);
    const [timeMedals, setTimeMedals] = useState(null);

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

    // function used to check for valid game. if invalid, user will be redirected to home page
    const checkGame = async () => {
        try {
            // now, query the list of games, where we are searching for a match with the game abbreviation
            // in the url
            let { data: game, error } = await supabase
                .from("game")
                .select("*")
                .eq("abb", abb)
                .single();

            // if game is invalid, error will be thrown
            if (error) {
                throw error;
            }

            // if no error, update game hook
            setGame(game);

        } catch(error) {
            // error code PGRST116: abb is not found in games table, so it must be invalid
            if (error.code === "PGRST116") {
                console.log("Error: Invalid game.");
                navigate("/");
            } else {
                alert(error.message);
                console.log(error);
            } 
        }
    };

    // this function is primarily used to get the total time for the game defined by abb. however,
    // this function also checks the category. if invalid, redirect user to home screen
    const getTimeTotal = async () => {
        try {
            // query level table
            let { data: timeArr, status, error } = await supabase
                .from("level")
                .select(`
                    time, 
                    misc,
                    mode (game (name))
                `)
                .eq("game", abb);

            // error checks
            if (error && status === 406) {
                throw error;
            }

            // update states
            const miscStatus = category === "misc" ? true : false;
            
            // now, calculate the total time
            let timeTotal = 0;
            timeArr.forEach(level => {
                if (level.misc === miscStatus) {
                    timeTotal += level.time;
                }
            });

            // once we have this, we can update maxTime hook
            setTotalTime(timeTotal);

        } catch (error) {
            if (error.code === 1) {
                console.log(error.message);
                navigate("/");
            } else {
                console.log(error);
                alert(error.message);
            }
        }
    };

    const queryAndGetTotalsMedals = async (timeTotal) => {
        // initialize variables
        const type = timeTotal === undefined ? "score" : "time";
        const miscStatus = category === "misc" ? true : false;

        try {
            // query submissions table
            let { data: submissions, status, error } = await supabase
                .from(`${type}_submission`)
                .select(`
                    profiles:user_id ( id, username, country, avatar_url ),
                    level (id, misc),
                    ${type},
                    live
                `)
                .eq("game_id", abb)
                .eq("live", true)
                .order(`${type}`, { ascending: false })

            // error check
            if (error && status !== 406) {
                throw error;
            }

            // first, let's start with totalizer
            const submissionCpy = [...submissions];
            const { liveTotalsMap } = createTotalMaps(submissions, miscStatus, type, totalTime);

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

            // finally update react hook
            type === "score" ? setScoreTotal(total) : setTimeTotal(total);
            console.log(total);

            // now, it's time to do medal table. 
            submissions = submissionCpy;
            submissions = submissions.filter(obj => obj.level.misc === miscStatus);
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

            // finally, update react hooks
            type === "score" ? setScoreMedals(medals) : setTimeMedals(medals);
            type === "score" ? setLoadingScore(false) : setLoadingTime(false);
            console.log(medals);

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    }

    return { 
        loading,
        loadingScore,
        loadingTime,
        game,
        totalTime, 
        user, 
        scoreTotal,
        scoreMedals,
        timeTotal,
        timeMedals,
        setLoading, 
        checkForUser,
        checkGame,
        getTimeTotal,
        queryAndGetTotalsMedals
    };
};

export default UserStatsInit;