/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import LevelboardUpdate from "../../database/update/LevelboardUpdate";
import SubmissionRead from "../../database/read/SubmissionRead";
import SubmissionsUpdate from "../../database/update/SubmissionsUpdate";
import { UserContext } from "../../App";

const SubmissionInit = () => {
    /* ===== CONTEXTS ===== */

    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== STATES ===== */
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState({});
    const [currentGame, setCurrentGame] = useState(null);
    const [approved, setApproved] = useState([]);
    const [approving, setApproving] = useState(false);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { insertNotification } = LevelboardUpdate();
    const { getSubmissions } = SubmissionRead();
    const { approve } = SubmissionsUpdate();

    // navigate used for redirecting
    const navigate = useNavigate("/");

    // function that handles when the user switches to a new game
    const swapGame = async (abb, submissionReducer) => {
        // first, ensure current user is a moderator. if not, redirect them to the home page
        const isMod = user.is_mod;
        if (!isMod) {
            console.log("Error: Forbidden access.");
            navigate("/");
            return;
        }

        // if we have not already loaded and merged the submissions for abb, we do so here
        if (!(abb in submissions)) {
            // updating loading hook
            setLoading(true);

            // retrive all submissions for abb concurrently
            const [allMainScoreSubmissions, allMiscScoreSubmissions, allMainTimeSubmissions, allMiscTimeSubmissions] = await Promise.all(
                [
                    getSubmissions(abb, "main", "score", submissionReducer), 
                    getSubmissions(abb, "misc", "score", submissionReducer), 
                    getSubmissions(abb, "main", "time", submissionReducer),
                    getSubmissions(abb, "misc", "time", submissionReducer)
                ]
            );

            // filter each list of levels by the "approved" field
            const mainScoreSubmissions = allMainScoreSubmissions.filter(row => !row.approved);
            const miscScoreSubmissions = allMiscScoreSubmissions.filter(row => !row.approved);
            const mainTimeSubmissions = allMainTimeSubmissions.filter(row => !row.approved);
            const miscTimeSubmissions = allMiscTimeSubmissions.filter(row => !row.approved);

            // now, concatenate all arrays into a single array, and sort it by the id field
            const unorderedMerged = mainScoreSubmissions.concat(miscScoreSubmissions, mainTimeSubmissions, miscTimeSubmissions);
            const merged = unorderedMerged.sort((a, b) => a.details.id.localeCompare(b.details.id));

            // finally, update the submissions state
            console.log(merged);
            setSubmissions( { ...submissions, [abb]: merged } );
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
        // prepare approval process
        setApproving(true);

        try {
            // first, let's approve all submissions in the submission table
            const approvePromises = approved.map(e => approve({ 
                user_id: e.user.id, 
                game_id: e.game.abb, 
                level_id: e.level.name,
                score: e.score
            }));
            await Promise.all(approvePromises);

            // once all submissions have been approved, let's notify each user that the approval was successful
            const notifPromises = approved.map(e => {
                return insertNotification({
                    notif_type: "approve",
                    user_id: e.user.id, 
                    game_id: e.game.abb, 
                    creator_id: user.id,
                    level_id: e.level.name,
                    score: e.score,
                    record: e.details.record,
                    submission_id: e.details.id
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
        swapGame,
        addToApproved,
        removeFromApproved,
        approveAll
    };
};

export default SubmissionInit;