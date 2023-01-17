import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SubmissionRead from "../../database/read/SubmissionRead";
import SubmissionsUpdate from "../../database/update/SubmissionsUpdate";

const SubmissionInit = () => {
    /* ===== STATES ===== */
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState({});
    const [currentGame, setCurrentGame] = useState(null);
    const [approved, setApproved] = useState([]);
    const [approving, setApproving] = useState(false);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { retrieveSubmissions } = SubmissionRead();
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
            let submissions = await retrieveSubmissions(abb, "score", scoreSubmissionState);
            const filteredScore = submissions.filter(row => !row.approved);
            submissions = await retrieveSubmissions(abb, "time", timeSubmissionState);
            const filteredTime = submissions.filter(row => !row.approved);
            
            // sort both arrays by submitted_at
            [filteredScore, filteredTime].map(arr => arr.sort((a, b) => a.submitted_at < b.submitted_at ? -1 : a.submitted_at > b.submitted_at ? 1 : 0));

            // now, let's merge submissions into a single array
            const merged = [];
            let i = 0, j = 0;
            const sr = filteredScore.map(row => Object.assign({}, row)), tr = filteredTime.map(row => Object.assign({}, row));
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
                    tr[j]["record"] = Number.parseFloat(timeRecord.time).toFixed(2);
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
                tr[j]["record"] = Number.parseFloat(timeRecord.time).toFixed(2);
                tr[j]["type"] = "time";
                delete tr[j].time;
                merged.push(timeRecord);
                j++;
            }
            
            // finally, update the submissions state
            setSubmissions( { ...submissions, [abb]: merged } );
            console.log(merged);
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
        const promises = approved.map(e => approve(e.type, e.profiles.id, e.game.abb, e.level.name));
        Promise.all(promises).then(() => window.location.reload()).catch((error) => console.log(error));
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