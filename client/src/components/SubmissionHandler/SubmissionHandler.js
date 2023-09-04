/* ===== IMPORTS ===== */
import { MessageContext, SubmissionContext, UserContext } from "../../utils/Contexts";
import { useContext, useReducer, useState } from "react";
import ApproveUpdate from "../../database/update/ApproveUpdate";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationUpdate from "../../database/update/NotificationUpdate";
import ReportDelete from "../../database/delete/ReportDelete";
import Submission2Delete from "../../database/delete/Submission2Delete";
import Submission2Update from "../../database/update/Submission2Update";

const SubmissionHandler = (isNew) => {
    /* ===== STATES ===== */
    const [game, setGame] = useState(undefined);
    const [checked, setChecked] = useState([]);

    /* ===== CONTEXTS ===== */

    // submissions state from submission context
    const { submissions } = useContext(SubmissionContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== REDUCER FUNCTIONS ===== */

    // REDUCER FUNCTION 1: reducer - function that will be the reducer function for the recent reducer
    // PRECONDITIONS (2 parameters):
    // 1.) state: stores the information of the recent state stored in the reducer hook
    // 2.) action: an object that typically has two parameters:
        // a.) type: specifies what operations this function should perform
        // b.) payload: an object that stores information used in the operations
    // POSTCONDITIONS (3 possible outcomes):
    // if type is set, the function will return the payload, which defines the recent state
    // if type is delete, the function will remove a submission object based on payload values
    // if type is add, the function will add a submission object based on payload values
    const reducer = (state, action) => {
        switch (action.type) {
            // case 1: set - simply return the payload
            case "set": {
                return action.payload;
            }

            // case 2: delete - using the key and submission from the payload, remove a submission object, update the checked
            // array state, and return the updated state 
            case "delete": {
                // first, we add the submission object to the checked array
                const submission = action.payload;
                setChecked(oldChecked => [submission, ...oldChecked]);

                // then, we can update the recent state
                const id = submission.id, abb = submission.level.mode.game.abb;
                const newArr = state[abb].filter(submission => submission.id !== id);
                return {
                    ...state,
                    [abb]: newArr
                };
            }

            // case 3: add - using the key and id from the payload, add a submission object while maintaining the order of the
            // array, and return the updated state
            case "add": {
                // first, we remove the submission from the checked state
                const submission = action.payload;
                setChecked(oldChecked => oldChecked.filter(row => row !== submission));

                // then, we use information from the submission to fetch a hard copy of the original submission found in the
                // submissionSet (set depends on the value of `isNew`)
                const id = submission.id, abb = submission.level.mode.game.abb;
                const submissionSet = isNew ? submissions.recent : submissions.reported;
                const originalSubmission = JSON.parse(JSON.stringify(submissionSet[abb].find(submission => submission.id === id)));

                // finally, we can update the recent state
                const newArr = [...state[abb], originalSubmission].sort((a, b) => {
                    return isNew ? a.id.localeCompare(b.id) : a.report.report_date.localeCompare(b.report.report_date);
                });
                return {
                    ...state,
                    [abb]: newArr
                };
            }

            // default case: simply return the state unchanged
            default: {
                return state;
            }
        };
    };

    /* ===== REDUCERS ===== */
    const [recent, dispatchRecent] = useReducer(reducer, undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { insertApproval } = ApproveUpdate();
    const { insertNotification } = NotificationUpdate();
    const { deleteReport } = ReportDelete();
    const { deleteSubmission2 } = Submission2Delete();
    const { updateSubmission2 } = Submission2Update();

    // helper functions
    const { cleanLevelName, recordB2F } = FrontendHelper();

    // FUNCTION 1: setRecent - a wrapper function that will set the recent reducer
    // PRECONDITIONS (1 parameter):
    // 1.) recentSubmissions: an object containing keys for each game, and the value of each key being an array of all 
    // the recent submissions
    // POSTCONDITIONS (1 possible outcome):
    // a deep clone of recent is created, and the state of recent is updated using the dispatchRecent function
    const setRecent = recentSubmissions => {
        // create two deep copies
        const recentDeepCopy = JSON.parse(JSON.stringify(recentSubmissions));

        // update our recent reducer, as well as the recent copy
        dispatchRecent({ type: "set", payload: recentDeepCopy });
    };

    // FUNCTION 2: setDefaultGame - function that sets the game state hook using the setGame() function with a default value
    // PRECONDITIONS (1 parameter):
    // 1.) recent: an object with a key for each game, where the value of each key is an array of submission objects
    // POSTCONDITIONS (1 possible outcome):
    // the name of the game who has the most submissions is used as the argument for the setGame() function
    const setDefaultGame = recent => {
        // determine the game with the most submissions
        const game = Object.keys(recent)
            .reduce((a, b) => recent[a].length > recent[b].length ? a : b);

        // update the game state hooks with default value
        setGame(game);
    };

    // FUNCTION 3: addToRecent - a wrapper function that calls the recent dispatcher function to add a submission to
    // the recent reducer (and consequently, remove it from the checked array)
    // PRECONDITIONS (1 parameter):
    // 1.) submission: a submission object currently stored in the checked array, which should be transferred over to the recent
    // reducder
    // POSTCONDITIONS (1 possible outcome):
    // the reducer function is called, which does the bulk of the work. see the documentation for this function higher in this file
    const addToRecent = submission => {
        dispatchRecent({ type: "add", payload: submission });
    };

    // FUNCTION 4: isClickable - a function that determines whether or not a submission can be clicked
    // PRECONDITIONS (3 parameters):
    // 1.) submission: a submission object
    // POSTCONDITIONS (2 possible outcomes):
    // in general, this function will return true
    // however, if the submission is NOT new, and the report that exists is either on a submission belonging to the current user,
    // or was created by the current user, we want to return false
    const isClickable = submission => {
        return !(!isNew && (submission.profile_id === user.profile.id || submission.report.creator.id === user.profile.id));
    }

    // FUNCTION 5: generateLevel1Promises - a function that returns an array of promises, which should be executed concurrently
    // PRECONDITIONS (1 parameter):
    // 1.) checked: an array of submissions, which should only be called after the user has selected the `Make Changes` button
    // of the submission handler component
    // POSTCONDITIONS (1 possible outcome):
    // an array of promises is generated, and returned
    const generateLevel1Promises = checked => {
        const level1Promises = checked.map(submission => {
            let promiseFunc;
            switch (submission.action) {
                // if action is approve, generate promise for approving a submission (note: action depends on `isNew` variable)
                case "approve":
                    // if isNew, we simply approve the submission
                    if (isNew) {
                        promiseFunc = insertApproval(submission.id, user.profile.id).catch(error => {
                            const rejectionReason = {
                                submission: submission,
                                error
                            };
                            return Promise.reject(rejectionReason);
                        });
                    } 

                    // otherwise, we delete the report, which will THEN approve as a db trigger function
                    else {
                        promiseFunc = deleteReport(submission.report.report_date).catch(error => {
                            const rejectionReason = {
                                submission: submission,
                                error
                            };
                            return Promise.reject(rejectionReason);
                        });
                    }
                    break;
                
                // if action is delete, generate a promise for deleting a submission
                case "delete":
                    promiseFunc = deleteSubmission2(submission.id).catch(error => {
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
                        submitted_at: submission.updates.submitted_at,
                        region_id: submission.updates.region_id,
                        monkey_id: submission.updates.monkey_id,
                        platform_id: submission.updates.platform_id,
                        proof: submission.updates.proof,
                        live: submission.updates.live,
                        tas: submission.updates.tas,
                        comment: submission.updates.comment
                    };
                    promiseFunc = updateSubmission2(payload, submission.id).catch(error => {
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

    // FUNCTION 6: generateLevel2Promises - a function that returns an array of promises, which should be executed concurrently
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
                        category: submission.level.category,
                        score: submission.score,
                        record: submission.record,
                        profile_id: submission.profile.id,
                        creator_id: user.profile.id,
                        notif_type: "delete",
                        tas: submission.tas
                    };
                    promiseFunc = insertNotification(notification).catch(error => {
                        const rejectionReason = {
                            submission: submission,
                            error
                        };
                        return Promise.reject(rejectionReason);
                    });
                    break;

                // if action is update, generate promise for approving a submission (note: action depends on `isNew` variable)
                case "update":
                    // if isNew, we simply approve the submission
                    if (isNew) {
                        promiseFunc = insertApproval(submission.id, user.profile.id).catch(error => {
                            const rejectionReason = {
                                submission: submission,
                                error
                            };
                            return Promise.reject(rejectionReason);
                        });
                    }
                    
                    // otherwise, we delete the report, which will THEN approve as a db trigger function
                    else {
                        promiseFunc = deleteReport(submission.report.report_date).catch(error => {
                            const rejectionReason = {
                                submission: submission,
                                error
                            };
                            return Promise.reject(rejectionReason);
                        });
                    }
                    break;

                default:
                    throw new Error("Unsupported action!");
            };

            return promiseFunc;
        });

        return level2Promises;
    };

    // FUNCTION 7: renderErrorMessages - given two arrays of failed queries, render a unique error message for each
    // PRECONDITIONS (2 parameters):
    // 1.) failedLevel1Queries - the array of all failed level 1 queries
    // 2.) failedLevel2Queries - the array of all failed level 2 queries
    // POSTCONDITIONS (1 possible outcome):
    // a unique error message is rendered to the user for each query that failed
    const renderErrorMessages = (failedLevel1Queries, failedLevel2Queries) => {
        failedLevel1Queries.forEach(query => {
            console.log(query);
            // define variables used for the error message
            const submission = query.reason.submission;
            const type = submission.score ? "Score" : "Time";

            // render error string
            let errorString = `The following submission failed to ${ submission.action }: ${ submission.level.mode.game.name }: ${ cleanLevelName(submission.level.name) } (${ type }) - ${ recordB2F(submission.record, type, submission.level.timer_type) } by ${ submission.profile.username }. Reload the page and try again.`;
            addMessage(errorString, "error");
        });

        failedLevel2Queries.forEach(query => {
            // define variables used for the error message
            const submission = query.reason.submission;
            const type = submission.score ? "Score" : "Time";

            // render the error string
            let errorString = `The following submission was successfully updated, but failed to approve: ${ submission.level.mode.game.name }: ${ cleanLevelName(submission.level.name) } (${ type }) - ${ recordB2F(submission.record, type, submission.level.timer_type) } by ${ submission.profile.username }. Reload the page and try again.`;
            addMessage(errorString, "error");
        });
    };

    // FUNCTION 8: handleChanges - code that executes when the user clicks the `make changes` button in the SubmissionHandler
    // component (for new submissions!)
    // PRECONDITIONS (1 parameter):
    // 1.) checked: an array of submissions with actions, which should have at least one element
    // POSTCONDITIONS (2 possible outcomes):
    // 1.) if all queries are successful (should be nearly always), the function will do it's thing, and simply reload
    // 2.) if even just one query fails, the page will render an error message that is specific to the failed query, and not reload
    const handleChanges = async checked => {
        // first, generate our promises, and run them concurrently
        const level1Promises = generateLevel1Promises(checked);
        const level1QueryResults = await Promise.allSettled(level1Promises);

        // next, create an array containing all the failed queries
        const failedLevel1Queries = level1QueryResults.filter(result => result.status === "rejected");

        // now, create a filtered checked array, which exclues submissions that should not have a level 2 query
        // associated with them
        const filteredChecked = checked.filter(submission => {
            // exclude submissions whose action is "approve"
            if (submission.action === "approve") {
                return false;
            }

            // exclude submissions with action "delete" and where submission.profile.id matches the current user's id
            if (submission.action === "delete" && submission.profile.id === user.profile.id) {
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

    return { 
        game, 
        recent, 
        checked, 
        setGame, 
        dispatchRecent, 
        setRecent, 
        setDefaultGame, 
        addToRecent, 
        isClickable, 
        handleChanges 
    };
};

/* ===== EXPORTS ===== */
export default SubmissionHandler;