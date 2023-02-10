import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../database/SupabaseClient";
import LevelboardUpdate from "../../database/update/LevelboardUpdate";
import SubmissionRead from "../../database/read/SubmissionRead";
import SubmissionsUpdate from "../../database/update/SubmissionsUpdate";

const SubmissionInit = () => {
    /* ===== VARIABLES ===== */
    const user = supabase.auth.user();

    /* ===== STATES ===== */
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState({});
    const [currentGame, setCurrentGame] = useState(null);
    const [approved, setApproved] = useState([]);
    const [approving, setApproving] = useState(false);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { insertNotification } = LevelboardUpdate();
    const { retrieveSubmissions, newQuery } = SubmissionRead();
    const { approve } = SubmissionsUpdate();

    // navigate used for redirecting
    const navigate = useNavigate("/");

    // function used to check if current user is a mod
    const validate = isMod => {
        if (!isMod) {
            console.log("Error: Forbidden access.");
            navigate("/");
            return false;
        }
        return true;
    };

    // function that handles when the user switches to a new game
    const swapGame = async (abb, scoreSubmissionState, timeSubmissionState) => {
        // if we have not already loaded and merged the submissions for abb, we do so here
        if (!(abb in submissions)) {
            // updating loading hook
            setLoading(true);

            // retrieve submissions for both score and time, and filter each by the approved field
            let gameSubmissions = await retrieveSubmissions(abb, "score", scoreSubmissionState);
            const filteredScore = gameSubmissions.filter(row => !row.approved);
            gameSubmissions = await retrieveSubmissions(abb, "time", timeSubmissionState);
            const filteredTime = gameSubmissions.filter(row => !row.approved);

            // NEW - retrive submissions for both score and time, and filter each by the approved field
            let newGameSubmissions = await newQuery(abb, "score");
            const newFilteredScore = newGameSubmissions.filter(row => !row.approved);
            newGameSubmissions = await newQuery(abb, "time");
            const newFilteredTime = newGameSubmissions.filter(row => !row.approved);
            
            // sort both arrays by submitted_at
            [filteredScore, filteredTime].map(arr => arr.sort((a, b) => a.submitted_at < b.submitted_at ? -1 : a.submitted_at > b.submitted_at ? 1 : 0));

            // NEW - sort both arrays by submitted_at
            [newFilteredScore, newFilteredTime].map(arr => arr.sort((a, b) => a.details.submitted_at.localeCompare(b.details.submitted_at)));

            // define variables used in the merging process
            const merged = [];
            let i = 0, j = 0;
            const sr = filteredScore.map(row => Object.assign({}, row)), tr = filteredTime.map(row => Object.assign({}, row));

            // NEW - define variables used in the merging process
            const newMerged = [];
            const scoreSubmissions = newFilteredScore.map(row => Object.assign({}, row)), timeSubmissions = newFilteredTime.map(row => Object.assign({}, row));

            // now, let's merge submissions into a single array
            while (i < sr.length && j < tr.length) {
                const scoreRecord = sr[i], timeRecord = tr[j];
                const scoreDate = scoreRecord.submitted_at, timeDate = timeRecord.submitted_at;
                if (scoreDate < timeDate) {
                    sr[i]["record"] = scoreRecord.score;
                    sr[i]["type"] = "score";
                    delete sr[i].score;
                    merged.push(scoreRecord);
                    i++;
                } else {
                    tr[j]["record"] = timeRecord.time;
                    tr[j]["type"] = "time";
                    delete tr[j].time;
                    merged.push(timeRecord);
                    j++;
                }
            }
            while (i < sr.length) {
                const scoreRecord = sr[i];
                sr[i]["record"] = scoreRecord.score;
                sr[i]["type"] = "score";
                delete sr[i].score;
                merged.push(scoreRecord);
                i++;
            }
            while (j < tr.length) {
                const timeRecord = tr[j];
                tr[j]["record"] = timeRecord.time;
                tr[j]["type"] = "time";
                delete tr[j].time;
                merged.push(timeRecord);
                j++;
            }

            // NEW - now, let's merge submissions into a single array
            i = 0;
            j = 0;

            // while both lists still have unmerged submissions, this loop will execute
            while (i < scoreSubmissions.length && j < timeSubmissions.length) {
                const score = scoreSubmissions[i], time = timeSubmissions[j];
                const scoreDate = score.details.submitted_at, timeDate = time.details.submitted_at;
                if (scoreDate < timeDate) {
                    newMerged.push(score);
                    i++;
                } else {
                    newMerged.push(time);
                    j++;
                }
            }
            
            // if any score submissions remain, merge them
            while (i < scoreSubmissions.length) {
                newMerged.push(scoreSubmissions[i]);
                i++;
            }

            // if any time submissions remain, merge them
            while (j < timeSubmissions.length) {
                newMerged.push(timeSubmissions[j]);
                j++;
            }

            // finally, update the submissions state
            setSubmissions( { ...submissions, [abb]: merged } );
            console.log(merged);

            // NEW - finally, update the submissions state
            console.log(`NEW UNAPPROVED ${ abb } SUBMISSIONS GENERATED FROM NEW BACK-END:`);
            console.log(newMerged);
        }

        // update game and loading state hooks
        setCurrentGame(abb);
        setLoading(false);
    };

    // function that moves a submissions from the list of submissions into the list of approved records
    const addToApproved = (submission, games) => {
        const game = games.find(row => row.abb === currentGame);
        setApproved([...approved, { ...submission, game: game }]);
        const filtered = submissions[currentGame].filter(row => row !== submission);
        setSubmissions({ ...submissions, [currentGame]: filtered });
        console.log(submissions);
        console.log(approved);
    };

    // function that moves a submission approved back to the submission list, in-order
    const removeFromApproved = (submission) => {
        const submissionAbb = submission.game.abb;
        delete submission.game;
        const sorted = [...submissions[submissionAbb], submission].sort((a, b) => a.submitted_at < b.submitted_at ? -1 : a.submitted_at > b.submitted_at ? 1 : 0);
        setSubmissions({ ...submissions, [submissionAbb]: sorted });
        setApproved(approved.filter(row => row !== submission));
        console.log(submissions);
    };

    // function that performs the bulk approvals to the submissions in the database
    // once all updates are done, the page will reload
    const approveAll = async () => {
        setApproving(true);
        try {
            // first, let's approve all submissions in the submission table
            const approvePromises = approved.map(e => approve({ type: e.type, user_id: e.profiles.id, game_id: e.game.abb, level_id: e.level.name }));
            await Promise.all(approvePromises);

            // once all submissions have been approved, let's notify each user that the approval was successful
            const notifPromises = approved.map(e => {
                return insertNotification({
                    type: e.type, 
                    user_id: e.profiles.id, 
                    game_id: e.game.abb,
                    mod_id: user.id,
                    level_id: e.level.name,
                    notif_type: "approve",
                    record: e.record,
                    old_approved: false,
                    approved: true
                });
            });
            await Promise.all(notifPromises);

            // once all notifications have been sent, reload the page
            window.location.reload();

        } catch(error) {
            console.log(error);
            alert(error.message);
        }
    };

    return { 
        loading, 
        submissions, 
        currentGame, 
        approved,
        approving,
        validate,
        swapGame,
        addToApproved,
        removeFromApproved,
        approveAll
    };
};

export default SubmissionInit;