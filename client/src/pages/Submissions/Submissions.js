/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { MessageContext, StaticCacheContext, UserContext } from "../../Contexts";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationUpdate from "../../database/update/NotificationUpdate";
import SubmissionRead from "../../database/read/SubmissionRead";
import SubmissionUpdate from "../../database/update/SubmissionUpdate";

const Submissions = () => {
    /* ===== CONTEXTS ===== */

    // user state from user context
    const { user } = useContext(UserContext);

    // static cache state from static cache context
    const { staticCache } = useContext(StaticCacheContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [selectedGame, setSelectedGame] = useState(null);
    const [submissions, setSubmissions] = useState({});
    const [approved, setApproved] = useState([]);
    const [approving, setApproving] = useState(false);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { cleanLevelName, recordB2F } = FrontendHelper();

    // database functions
    const { insertNotification } = NotificationUpdate();
    const { getSubmissions } = SubmissionRead();
    const { approveSubmission } = SubmissionUpdate();

    // FUNCTION 1: swapGame - given an abb and the submissionReducer, update the game state, and load all submissions for a game
    // PRECONDITIONS (2 parameters):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // 2.) submissionReducer: an object with two fields:
        // a.) reducer: the submission reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (3 possible outcomes):
    // if the submissions have already been loaded for abb, all this function needs to do is update the game hook by calling
    // the setSelectedGame() hook with the abb argument
    // if the submissions have not been loaded yet for abb, we need to retrieve them from the database, filter, and order them. 
        // if the query is a success, we need to call the setSubmissions() object to update the submission state with the submissions 
        // for abb
        // if the query is a failure, an error message is rendered to the user, and the submissions state is NOT updated.
    const swapGame = async (abb, submissionReducer) => {
        // update the selectedGame state hook with the abb parameter
        setSelectedGame(abb);

        // if we have not already loaded and merged the submissions for abb, we do so here
        if (!(abb in submissions)) {
            try {
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
                setSubmissions( { ...submissions, [abb]: merged } );

            } catch (error) {
                // if the submissions fail to be fetched, let's render an error specifying the issue
                const gameName = staticCache.games.find(row => row.abb === abb).name;
			    addMessage(`Failed to fetch submission data for ${ gameName }. If refreshing the page does not work, the database may be experiencing some issues.`, "error");
            }
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
        if (!approving) {
            const games = staticCache.games;
            const game = games.find(row => row.abb === selectedGame);
            setApproved([...approved, { ...submission, game: game }]);
            const filtered = submissions[selectedGame].filter(row => row !== submission);
            setSubmissions({ ...submissions, [selectedGame]: filtered });
        }
    };

    // FUNCTION 3: removeFromApproved - given a submission object from the approved array, move it from there back to the submission object
    // PRECONDITIONS (1 parameter):
    // 1.) submission: a submission object from the approved array
    // POSTCONDITIONS (1 possible outcomes):
    // first, the game field is removed from the submission object. then, the setSubmissions() function is called, with the submission object
    // as argument, including the submission object placed back in the proper, ordered place. funally, the setApproved() function is called,
    // with the approved array as argument, minus the submission object
    const removeFromApproved = (submission) => {
        if (!approving) {
            const submissionAbb = submission.game.abb;
            delete submission.game;
            const sorted = [...submissions[submissionAbb], submission].sort((a, b) => a.details.id.localeCompare(b.details.id));
            setSubmissions({ ...submissions, [submissionAbb]: sorted });
            setApproved(approved.filter(row => row !== submission));
        }
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

        // first, let's generate our array of approved submission functions
        const approvePromises = approved.map(e =>
            approveSubmission({
                profile_id: e.profile.id,
                game_id: e.game.abb,
                level_id: e.level.name,
                score: e.score
            }).catch(error => {
                // Handle individual approval error
                const rejectionReason = {
                    submission: {
                        id: e.details.id,
                        record: e.details.record,
                        profile: e.profile,
                        game: e.game,
                        level_id: e.level.name,
                        score: e.score
                    },
                    error
                };
                return Promise.reject(rejectionReason); // Propagate the error further
            })
        );

        // concurrently approve all submissions
        const approveResults = await Promise.allSettled(approvePromises);

        // based on the results of each query, filter out any approvals that failed to approve, as well as any submissions that
        // belong to the user, so we do not send any false notifications
        const failedApprovals = approveResults.filter(result => result.status === "rejected");
        const failedSubmissionIds = failedApprovals.map(row => row.reason.submission.id);
        const filteredApproved = approved.filter(submission => {
            return !failedSubmissionIds.includes(submission.details.id) && submission.profile.id !== user.profile.id
        });

        // next, let's generate our array of notification creation functions
        const notifPromises = filteredApproved.map(e =>
            insertNotification({
                notif_type: "approve",
                profile_id: e.profile.id, 
                game_id: e.game.abb, 
                creator_id: user.profile.id,
                level_id: e.level.name,
                score: e.score,
                record: e.details.record,
                submission_id: e.details.id
            }).catch(error => {
                // Handle individual notification error
                return Promise.reject(error); // Propagate the error further
            })
        );

        // concurrently handle notifications
        await Promise.allSettled(notifPromises);

        // if any of the approvals failed, now is the time to inform the user
        if (failedApprovals.length > 0) {
            const messages = failedApprovals.map(row => {
                const submission = row.reason.submission;
                const type = submission.score ? "Score" : "Time";
                return `The following submission failed to approve: ${ submission.game.name }: ${ cleanLevelName(submission.level_id) } (${ type }) - ${ recordB2F(submission.record, type) } by ${ submission.profile.username }. Reload the page and try again.`;
            });
            addMessage(messages, "error");
        } 
        
        // otherwise, just reload the page
        else {
            window.location.reload();
        }
    };

    return { 
        submissions, 
        selectedGame, 
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