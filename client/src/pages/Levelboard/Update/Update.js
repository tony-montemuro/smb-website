/* ===== IMPORTS ===== */
import { GameContext, PopupContext, MessageContext } from "../../../utils/Contexts";
import { useContext, useReducer } from "react";
import { useLocation } from "react-router-dom";
import FrontendHelper from "../../../helper/FrontendHelper";
import DateHelper from "../../../helper/DateHelper";
import SubmissionUpdate from "../../../database/update/SubmissionUpdate";
import ValidationHelper from "../../../helper/ValidationHelper";

const Update = (level, setSubmitting) => {
    /* ===== REDUCER FUNCTIONS ===== */

    // FUNCTION 1: reducer - function that executes each time the user attempts to update the from reducer hook
    // PRECONDITIONS (2 parameters):
    // 1.) state: the state of the form object when the function is called
    // 2.) action: an object with two fields:
        // a.) field: specifies which field of the form the reducer should modify
        // b.) value: specifies the new value that the reducer should use to modify form[field]
    // POSTCONDITIONS (4 possible outcomes):
    // if field is "values", update the `values` state. in this case, `action.value` is expected to be an object, and as such, 
    // one or more fields of `form.values` can be updated. any fields in `form.values` that have a corresponding
    // error in `form.error` are also reset to default value (undefined)
    // if the field is "error", update the `error` state. in this case, `action.value` is expected to be an object, and as such,
    // one or more fields of `form.error` can be updated.
    // if the field is "all", the form is reset back to it's default state
    // otherwise, this function expects `action.field` to be a string representing a valid form field, and `value` to be a single
    // value
    const reducer = (state, action) => {
        const field = action.field, value = action.value;
		switch(field) {
			case "values":
                // generate error object using `state.error`, and `value`
                const error = {};
                Object.keys(value).forEach(key => {
                    if (key in state.error) error[key] = undefined;
                });

				return {
					...state,
                    error: {
                        ...state.error,
                        ...error
                    },
					values: {
						...state.values,
						...value
					}
				};
            case "error": {
                return {
                    ...state,
                    [field]: {
                        ...state[field],
                        ...value
                    }
                };
            }
			case "all":
				return formInit;
			default:
				return { ...state, [field]: value };
		}
	};

    /* ===== VARIABLES ===== */
    const location = useLocation();
    const path = location.pathname.split("/");
    const category = path[3];
    const type = path[4];
    const errorInit = { 
        proof: undefined, 
        submitted_at: undefined, 
        live: undefined 
    };
    const formInit = {
		values: null,
		error: errorInit,
        submission: null
	};

    /* ===== REDUCERS ===== */
    const [form, dispatchForm] = useReducer(reducer, formInit);

    /* ===== CONTEXTS ===== */

    // game state, version state, & handle version change function from game context
    const { game, version, handleVersionChange } = useContext(GameContext);

    // close popup function from popup context
    const { closePopup } = useContext(PopupContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { updateSubmission } = SubmissionUpdate();

    // helper functions
    const { getDateOfSubmission } = DateHelper();
    const { dateB2F, recordB2F } = FrontendHelper();
    const { validateVideoUrl, validateDate, validateLive } = ValidationHelper();

    // FUNCTION 1: submission2Form ("submission to form") - function that generates the form object given a submission
    // PRECONDITIONS (1 parameter):
    // 1.) submission: the submission object we wish to convert to the "form" form
    // POSTCONDITIONS (1 possible outcome):
    // take the submission object, and convert it to a form compatible with the update submission form
    const submission2Form = submission => {
        return {
            id: submission.id,
            record: recordB2F(submission.record, type, level.timer_type),
            score: submission.score,
            monkey_id: submission.monkey.id,
            platform_id: submission.platform.id,
            region_id: submission.region.id,
            live: submission.live,
            proof: submission.proof,
            comment: submission.comment ? submission.comment : "",
            profile_id: submission.profile.id,
            game_id: game.abb,
            level_id: level.name,
            category: category,
            submitted_at: dateB2F(submission.submitted_at),
            tas: submission.tas,
            approved: submission.approve ? true : false,
            version: submission.version ?? ""
        };
    }

    // FUNCTION 2: handleSubmissionChange - function that runs when the user wants to change the submission
    // PRECONDITIONS (1 parameter):
    // 1.) submission: a submission object, which the user wishes to switch to
    // POSTCONDITIONS (1 possible outcome):
    // we use the `id` parameter to fetch the submission we want to change to, and update the form accordingly
    const handleSubmissionChange = submission => {
        const formVals = submission2Form(submission);
        dispatchForm({ field: "values", value: formVals });
        dispatchForm({ field: "submission", value: submission });
        dispatchForm({ field: "error", value: errorInit });
    };

    // FUNCTION 3: handleChange - function that is called whenever the user makes any change to the form
    // PRECONDITIONS (1 parameter):
	// 1.) e: an event object generated when the user makes a change to the form
	// POSTCONDITIONS (2 possible outcomes):
	// if the field id is live / tas, we use the checked variable rather than the value variable to update the form
	// otherwise, we simply update the form field based on the value variable
	const handleChange = e => {
        // descruct properties of e.target used in this function
        const { id, value, checked } = e.target;

        // special case: if id is "live" or "tas", we want to use `checked` as our value
        if (id === "live" || id === "tas") {
            dispatchForm({ field: "values", value: { [id]: checked } });
        } 
        
        // otherwise, we simply use the `value` property as our updated value
        else {
            dispatchForm({ field: "values", value: { [id]: value } });
        }
    };

    // FUNCTION 4: handleSubmittedAtChange - handle a change to the `submitted_at` field in the submission form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user makes a change to the `submitted_at` field of the submission form
    // POSTCONDITIONS (1 possible outcome):
    // the `submitted_at` field is updated using the date the user selected by the date picker
    const handleSubmittedAtChange = e => {
        let submitted_at = null;
        if (e) {
            let { $d: date } = e;
            const year = date.getFullYear();
            const month = String(date.getMonth()+1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            submitted_at = `${ year }-${ month }-${ day }`;
        }
        dispatchForm({ field: "values", value: { submitted_at } });
    };

    // FUNCTION 5: isFormUnchanged - function that checks whether or not the form was unchanged
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if not a single form value is different than the value in submission, we return true
    // otherwise, return false
    const isFormUnchanged = () => {
        return form.values.submitted_at === dateB2F(form.submission.submitted_at)
            && parseInt(form.values.version) === form.submission.version
            && parseInt(form.values.monkey_id) === form.submission.monkey.id
            && parseInt(form.values.platform_id) === form.submission.platform.id
            && parseInt(form.values.region_id) === form.submission.region.id
            && form.values.proof === form.submission.proof
            && form.values.live === form.submission.live
            && form.values.tas === form.submission.tas
            && form.values.comment === form.submission.comment;
    };

    // FUNCTION 6: getUpdateFromForm - takes form data, and extracts only the updatable information
    // PRECONDITIONS (4 parameters):
    // 1.) formVals: an object that stores the updated submission form values
    // 2.) date: a string representing the backend date of a submission
    // POSTCONDITIONS (1 possible outcome):
    // unnecessary form data is shaved off, returning only the attributes that are "updatable" according to the db
    // the date parameter is also used to determine the "submitted_at" field
    const getUpdateFromForm = (formVals, date) => {
        // create our new updatedData object, which is equivelent to formVals minus the following fields:
        // id, game_id, level_id, score, record, position, all_position, profile_id, approved
        const { 
            id,
            game_id,
            level_id,
            category,
            score,
            record,
            position,
            all_position,
            profile_id,
            approved,
            version,
            ...updatedData 
        } = formVals;

        // add additional fields to submission object
        updatedData.submitted_at = date;
        updatedData.version = version ? version : null

        return updatedData;
    };

    // FUNCTION 7: handleSubmit - function that is called when the user submits the form
    // PRECONDITIONS (3 parameters):
    // 1.) e: an event object which is generated when the user submits the update submission form
    // 2.) submissions: an array of all submission objects belonging to the current user for the current level
    // 3.) updateBoard: a function that, when called, will update the level leaderboard
    // POSTCONDITIONS (3 possible outcomes):
    // if the form fails to validate, the function will return early, and the user will be shown the errors
    // if the form successfully validates, but the data fails to submit, the submission process is halted, and the user is displayed an
    // error message
    // if the form successfully validates, and the data successfully submits, then the page is reloaded
    const handleSubmit = async (e, submissions, updateBoard) => {
        // initialize submission
		e.preventDefault();

        // create an error object that will store error messages for each field value that needs to
		// be validated
		const error = {};
		Object.keys(form.error).forEach(field => error[field] = undefined);

        // perform form validation
		error.proof = validateVideoUrl(form.values.proof);
		error.submitted_at = validateDate(form.values.submitted_at);
        error.live = validateLive(form.values.live, form.values.proof);

        // if any errors are determined, let's return
        dispatchForm({ field: "error", value: error });
		if (Object.values(error).some(row => row !== undefined)) {
            addMessage("One or more form fields had errors.", "error", 7000);
            return;
        }

        // if we made it this far, no errors were detected, we can begin our submission process
        setSubmitting(true);
        const submission = submissions.find(submission => submission.id === form.values.id);
		const backendDate = getDateOfSubmission(form.values.submitted_at, submission.submitted_at);
		const updatedData = getUpdateFromForm(form.values, backendDate);
        const id = submission.id;
        try {
            await updateSubmission(updatedData, id);

            // if user submits with a version that differs from the current version, then we want to update the version
            // this action will automatically update the board, so we can rely on that instead of updating directly
            const submissionVersion = updatedData.version;
            if (submissionVersion !== null && submissionVersion !== parseInt(version?.id)) {
                handleVersionChange(submissionVersion);
            } else {
                await updateBoard();
            }

            // finally, let the user know that they successfully submitted their submission, and close the popup
            addMessage("Your submission was successfully updated!", "success", 5000);
            closePopup();

        } catch (error) {
            addMessage("Ther was a problem updating your submission. Try refreshing the page.", "error", 8000);

        } finally {
            setSubmitting(false);
        };
    };

    return { form, handleSubmissionChange, handleChange, handleSubmittedAtChange, isFormUnchanged, handleSubmit };
};

/* ===== EXPORTS ===== */
export default Update;