import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

const SubmissionInit = () => {
    // states
    const [loading, setLoading] = useState(true);
    const [gameList, setGameList] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [timeRecords, setTimeRecords] = useState({ list: [], loaded: false });
    const [scoreRecords, setScoreRecords] = useState({ list: [], loaded: false });
    const [currentGame, setCurrentGame] = useState("smb1");

    // variables
    const navigate = useNavigate("/");

    // function used to check if current user is a mod
    const checkForMod = async (isMod) => {
        if (!isMod) {
            console.log("Error: Forbidden access.");
            navigate("/");
        }
    };

    // function that will query to get list of games
    const queryGames = async() => {
        try {
            // query game table
            const { data: games, error, status } = await supabase
                .from("game")
                .select("abb, name")
                .order("id")
                .order("custom");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // update react hook with list of games
            setGameList(games);

        } catch(error) {
            console.log(error);
            alert(error.message);
            navigate("/");
        }
    };

    // function that will query the submissions for mode. specifically, it is looking
    // for records that have NOT been approved
    const querySubmissions = async(mode) => {
        try {
            // query submission table
            const { data: r, error, status } = await supabase
                .from(`${mode}_submission`)
                .select(`
                    profiles (id, username, country),
                    level (name, misc, mode (game (abb, name, id))),
                    ${mode},
                    submitted_at,
                    proof,
                    comment,
                    live
                `)
                .eq("approved", false)
                .order("submitted_at");
            
            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // finally, update react state hooks
            const obj = { list: r, loaded: true };
            mode === "score" ? setScoreRecords(obj) : setTimeRecords(obj);
            console.log(r);

        } catch(error) {
            console.log(error);
            alert(error.message);
        }
    };

    // function that takes the two sets of records: scores and times, and merges
    // them together, in order of data submitted, and combintes them into a single
    // submissions object
    const mergeRecords = () => {
        // first, set up object representing all the submissions
        const submissionObj = {};
        gameList.forEach(game => {
            const abb = game.abb;
            submissionObj[abb] = [];
        });
        
        // now, fill it
        let i = 0, j = 0;
        const sr = scoreRecords.list, tr = timeRecords.list;
        while (i < sr.length && j < tr.length) {
            const scoreRecord = sr[i], timeRecord = tr[j];
            const scoreDate = scoreRecord.submitted_at, timeDate = timeRecord.submitted_at;
            if (scoreDate < timeDate) {
                sr[i]["record"] = scoreRecord.score;
                sr[i]["is_score"] = true;
                delete sr[i].score;
                submissionObj[scoreRecord.level.mode.game.abb].push(scoreRecord);
                i++;
            } else {
                tr[j]["record"] = Number.parseFloat(timeRecord.time).toFixed(2);
                sr[i]["is_score"] = false;
                delete tr[j].time;
                submissionObj[timeRecord.level.mode.game.abb].push(timeRecord);
                j++;
            }
        }
        while (i < sr.length) {
            const scoreRecord = sr[i];
            sr[i]["record"] = scoreRecord.score;
            sr[i]["is_score"] = true;
            delete sr[i].score;
            submissionObj[scoreRecord.level.mode.game.abb].push(scoreRecord);
            i++;
        }
        while (j < tr.length) {
            const timeRecord = tr[j];
            tr[j]["record"] = Number.parseFloat(timeRecord.time).toFixed(2);
            sr[i]["is_score"] = false;
            delete tr[j].time;
            submissionObj[timeRecord.level.mode.game.abb].push(timeRecord);
            j++;
        }

        // finally, update react states
        setSubmissions(submissionObj);
        setLoading(false);
        console.log(submissionObj);
    };

    // function that will update the currentGame based on the user's selection
    const changeGame = (game) => {
        setCurrentGame(game);
    };

    // function that is called when a moderator has reviewed a submission
    const approveSubmission = async (approvedRecord) => {
        // create a copy of the list of submissions without the reviewed submission
        // also, grab the record we are approving, since information about it is needed to update
        const filtered = submissions[currentGame].filter(item => {
            return item !== approvedRecord
        });

        // now, update the submissions object
        setSubmissions(submissions => ({...submissions, [currentGame]: filtered}));

        // finally, make a query to the recent submissions page to remove this submission
        const mode = approvedRecord.is_score ? "score" : "time";
        const userId = approvedRecord.profiles.id;
        console.log(userId);
        const gameId = approvedRecord.level.mode.game.abb;
        const levelId = approvedRecord.level.name;
        try {
            const { error } = await supabase
                .from(`${mode}_submission`)
                .update({ approved: true })
                .eq("user_id", userId)
                .eq("game_id", gameId)
                .eq("level_id", levelId)

            // error handling
            if (error) {
                throw (error);
            }

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    return { 
        loading, 
        gameList, 
        scoreRecords,
        timeRecords,
        submissions, 
        currentGame, 
        checkForMod, 
        queryGames,
        querySubmissions,
        mergeRecords,
        changeGame, 
        approveSubmission
    };
}

export default SubmissionInit;