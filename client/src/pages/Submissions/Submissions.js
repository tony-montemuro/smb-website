/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { StaticCacheContext, UserContext } from "../../Contexts";
import NotificationUpdate from "../../database/update/NotificationUpdate";
import SubmissionRead from "../../database/read/SubmissionRead";
import SubmissionUpdate from "../../database/update/SubmissionUpdate";

const Submissions = () => {
    /* ===== CONTEXTS ===== */

    // user state from user context
    const { user } = useContext(UserContext);

    // static cache state from static cache context
    const { staticCache } = useContext(StaticCacheContext);

    /* ===== STATES ===== */
    const [game, setGame] = useState(null);
    const [submissions, setSubmissions] = useState({});
    const [approved, setApproved] = useState([]);
    const [approving, setApproving] = useState(false);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { insertNotification } = NotificationUpdate();
    const { getSubmissions } = SubmissionRead();
    const { approveSubmission } = SubmissionUpdate();

    // FUNCTION 1: swapGame - given an abb and the submissionReducer, update the game state, and load all submissions for a game
    // PRECONDITIONS (2 parameters):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // 2.) submissionReducer: an object with two fields:
        // a.) reducer: the submission reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (2 possible outcomes):
    // if the submissions have already been loaded for abb, all this function needs to do is update the game hook by calling
    // the setGame() hook with the abb argument
    // if the submissions have not been loaded yet for abb, we need to retrieve them from the database, filter, and order them. finally,
    // we need to call the setSubmissions() object to update the submission state with the submissions for abb [note: setGame is also called
    // in this outcome]
    const swapGame = async (abb, submissionReducer) => {
        // update the game state hook with the abb parameter
        setGame(abb);

        // if we have not already loaded and merged the submissions for abb, we do so here
        if (!(abb in submissions)) {
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
    };

    // FUNCTION 2: addToApproved - given a submission object from the submission state, move it from there to the approved state
    // PRECONDITIONS (1 parameter):
    // 1.) submission: a submission object from the submissions state
    // POSTCONDITIONS (1 possible outcomes):
    // first, the game object associated with the submission is fetched from the static cache. then, the setApproved() function is called
    // with the approved array as argument, with the submission object appended to the end. finally, the setSubmission() function is called,
    // with an identical submissions object as argument, minus the submission passed as parameter to the function
    const addToApproved = (submission) => {
        const games = staticCache.games;
        const gameObj = games.find(row => row.abb === game);
        setApproved([...approved, { ...submission, game: gameObj }]);
        const filtered = submissions[game].filter(row => row !== submission);
        setSubmissions({ ...submissions, [game]: filtered });
        console.log(submissions);
        console.log(approved);
    };

    // FUNCTION 3: removeFromApproved - given a submission object from the approved array, move it from there back to the submission object
    // PRECONDITIONS (1 parameter):
    // 1.) submission: a submission object from the approved array
    // POSTCONDITIONS (1 possible outcomes):
    // first, the game field is removed from the submission object. then, the setSubmissions() function is called, with the submission object
    // as argument, including the submission object placed back in the proper, ordered place. funally, the setApproved() function is called,
    // with the approved array as argument, minus the submission object
    const removeFromApproved = (submission) => {
        const submissionAbb = submission.game.abb;
        delete submission.game;
        const sorted = [...submissions[submissionAbb], submission].sort((a, b) => a.submitted_at < b.submitted_at ? -1 : a.submitted_at > b.submitted_at ? 1 : 0);
        setSubmissions({ ...submissions, [submissionAbb]: sorted });
        setApproved(approved.filter(row => row !== submission));
        console.log(submissions);
    };

    // FUNCTION 4: approveAll - approve all submissions in the approved array in the database
    // PRECONDITIONS (1 condition):
    // 1.) the approved state array is non-empty
    // POSTCONDITIONS (2 possible outcomes):
    // if all approvals and notifications are done successfully, the page will simply reload.
    // if any fail, the error will be caught in this function, shown to the user, and the page will NOT reload
    const approveAll = async () => {
        // prepare approval process
        setApproving(true);

        try {
            // first, let's approve all submissions in the submission table
            const approvePromises = approved.map(e => approveSubmission({ 
                profile_id: e.profile.id, 
                game_id: e.game.abb, 
                level_id: e.level.name,
                score: e.score
            }));
            await Promise.all(approvePromises);

            // once all submissions have been approved, let's notify each user other than the current user that the approval was successful
            const filteredApproved = approved.filter(row => row.profile.id !== user.profile.id);
            const notifPromises = filteredApproved.map(e => {
                return insertNotification({
                    notif_type: "approve",
                    profile_id: e.profile.id, 
                    game_id: e.game.abb, 
                    creator_id: user.profile.id,
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
            setApproving(false);
        }
    };

    return { 
        submissions, 
        game, 
        approved,
        approving,
        swapGame,
        addToApproved,
        removeFromApproved,
        approveAll
    };
};

/* ===== EXPORTS ===== */
export default Submissions;