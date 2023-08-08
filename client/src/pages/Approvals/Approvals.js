/* ===== IMPORTS ===== */
import { MessageContext, UserContext } from "../../utils/Contexts";
import { useContext } from "react";
import AllSubmissionDelete from "../../database/delete/AllSubmissionDelete";
import AllSubmissionUpdate from "../../database/update/AllSubmissionUpdate";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationUpdate from "../../database/update/NotificationUpdate";
import SubmissionUpdate from "../../database/update/SubmissionUpdate";

const Approvals = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { deleteSubmission } = AllSubmissionDelete();
    const { updateSubmission } = AllSubmissionUpdate();
    const { insertNotification } = NotificationUpdate();
    const { approveSubmission } = SubmissionUpdate();

    // helper functions
    const { cleanLevelName, recordB2F } = FrontendHelper();

    // FUNCTION 1: generateLevel1Promises - a function that returns an array of promises, which should be executed concurrently
    // PRECONDITIONS (1 parameter):
    // 1.) checked: an array of submissions, which should only be called after the user has selected the `Make Changes` button
    // of the submission handler component
    // POSTCONDITIONS (1 possible outcome):
    // an array of promises is generated, and returned
    const generateLevel1Promises = checked => {
        const level1Promises = checked.map(submission => {
            let promiseFunc;
            switch (submission.action) {
                // if action is approve, generate promise for approving a submission
                case "approve":
                    promiseFunc = approveSubmission(submission).catch(error => {
                        const rejectionReason = {
                            submission: submission,
                            error
                        };
                        return Promise.reject(rejectionReason);
                    });
                    break;
                
                // if action is delete, generate a promise for deleting a submission
                case "delete":
                    promiseFunc = deleteSubmission(submission.details.id).catch(error => {
                        const rejectionReason = {
                            submission: submission,
                            error
                        };
                        return Promise.reject(rejectionReason);
                    });
                    break;

                // if action is update, generate an update payload & update submission promise
                case "update":
                    const payload = {
                        submitted_at: submission.details.submitted_at,
                        region_id: submission.details.region.id,
                        monkey_id: submission.details.monkey.id,
                        proof: submission.details.proof,
                        live: submission.details.live,
                        comment: submission.details.comment
                    };
                    promiseFunc = updateSubmission(payload, submission.details.id).catch(error => {
                        const rejectionReason = {
                            submission: submission,
                            error
                        };
                        return Promise.reject(rejectionReason);               
                    });
                    break;

                // otherwise, throw an error
                default:
                    throw new Error("Unsupported action!");
            };

            return promiseFunc;
        });

        return level1Promises;
    };

    // FUNCTION 2: generateLevel2Promises - a function that returns an array of promises, which should be executed concurrently
    // PRECONDITIONS (1 parameter):
    // 1.) filteredChecked - a filtered version of `checked` which only includes submissions that should have a level 2 query
    // POSTCONDITIONS (1 possible outcome):
    // an array of promises is generated, and returned
    const generateLevel2Promises = filteredChecked => {
        const level2Promises = filteredChecked.map(submission => {
            let promiseFunc;
            switch (submission.action) {
                // if action is delete, generate a notification object and insert notification promise
                case "delete":
                    const notification = {
                        message: submission.message,
                        game_id: submission.level.mode.game.abb,
                        level_id: submission.level.name,
                        score: submission.score,
                        record: submission.details.record,
                        profile_id: submission.profile.id,
                        creator_id: user.profile.id,
                        notif_type: "delete"
                    };
                    promiseFunc = insertNotification(notification).catch(error => {
                        const rejectionReason = {
                            submission: submission,
                            error
                        };
                        return Promise.reject(rejectionReason);
                    });
                    break;

                 // if action is update, generate promise for approving a submission
                case "update":
                    promiseFunc = approveSubmission(submission).catch(error => {
                        const rejectionReason = {
                            submission: submission,
                            error
                        };
                        return Promise.reject(rejectionReason);
                    });
                    break;
                default:
                    throw new Error("Unsupported action!");
            };

            return promiseFunc;
        });

        return level2Promises;
    };

    // FUNCTION 3: renderErrorMessages - given two arrays of failed queries, render a unique error message for each
    // PRECONDITIONS (2 parameters):
    // 1.) failedLevel1Queries - the array of all failed level 1 queries
    // 2.) failedLevel2Queries - the array of all failed level 2 queries
    // POSTCONDITIONS (1 possible outcome):
    // a unique error message is rendered to the user for each query that failed
    const renderErrorMessages = (failedLevel1Queries, failedLevel2Queries) => {
        failedLevel1Queries.forEach(query => {
            // define variables used for the error message
            const submission = query.reason.submission;
            const type = submission.score ? "Score" : "Time";

            // render error string
            let errorString = `The following submission failed to ${ submission.action }: ${ submission.level.mode.game.name }: ${ cleanLevelName(submission.level.name) } (${ type }) - ${ recordB2F(submission.details.record, type) } by ${ submission.profile.username }. Reload the page and try again.`;
            addMessage(errorString, "error");
        });

        failedLevel2Queries.forEach(query => {
            // define variables used for the error message
            const submission = query.reason.submission;
            const type = submission.score ? "Score" : "Time";

            // render the error string
            let errorString = `The following submission was successfully updated, but failed to approve: ${ submission.level.mode.game.name }: ${ cleanLevelName(submission.level.name) } (${ type }) - ${ recordB2F(submission.details.record, type) } by ${ submission.profile.username }. Reload the page and try again.`;
            addMessage(errorString, "error");
        });
    };

    // FUNCTION 4: handleChanges - code that executes when the user clicks the `make changes` button
    // PRECONDITIONS (1 condition):
    // 1.) checked: an array of submissions, which should have at least one element
    // POSTCONDITIONS (2 possible outcomes):
    // 1.) if all queries are successful (should be nearly always), the function will do it's thing, and simply reload
    // 2.) if even just one query fails, the page will render an error message that is specific to the failed query, and not reload
    const handleChanges = async checked => {
        // first, generate our promises, and run them concurrently
        const level1Promises = generateLevel1Promises(checked);
        const level1QueryResults = await Promise.allSettled(level1Promises);
        console.log(level1QueryResults);

        // next, create an array containing all the failed queries
        const failedLevel1Queries = level1QueryResults.filter(result => result.status === "rejected");

        // now, create a filtered checked array, which exclues submissions that should not have a level 2 query
        // associated with them
        const filteredChecked = checked.filter(submission => {
            // exclude submissions whose action is "approve"
            if (submission.action === "approve") {
                return false;
            }

            // exclude submissions with action "delete" and where submission.details.id matches the current user's id
            if (submission.action === "delete" && submission.details.id === user.profile.id) {
                return false;
            }

            // exclude submissions that failed at level 1
            if (failedLevel1Queries.some(query => query.reason.submission === submission)) {
                return false;
            }

            return true;
        });

        // now, let's generate level 2 promises, and run them concurrently
        const level2Promises = generateLevel2Promises(filteredChecked);
        const level2QueryResults = await Promise.allSettled(level2Promises);

        // next, create an array containing all the relevant failed queries
        const failedLevel2Queries = level2QueryResults.filter(result => {
            return result.status === "rejected" && result.reason.submission.action === "update"
        });

        // finally, if there are any query fails, render the messages. otherwise, reload the page
        if (failedLevel1Queries.length > 0 || failedLevel2Queries.length > 0) {
            renderErrorMessages(failedLevel1Queries, failedLevel2Queries);
        } else {
            window.location.reload();
        }
    };

    return { handleChanges };
};

/* ===== EXPORTS ===== */
export default Approvals;