/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import DateHelper from "../../helper/DateHelper";
import FrontendHelper from "../../helper/FrontendHelper";
import ValidationHelper from "../../helper/ValidationHelper";

const SubmissionPopup = () => {
    /* ===== VARIABLES ===== */
    const defaultForm = { 
        values: null, 
        error: {
            proof: null,
            comment: null,
            message: null
        }
    };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [form, setForm] = useState(defaultForm);
    const [showReject, setShowReject] = useState(false);

    /* ===== FUNCTIONS ===== */
    
    // helper functions
    const { dateB2F } = FrontendHelper();
    const { validateProof, validateComment, validateMessage } = ValidationHelper();
    const { getDateOfSubmission } = DateHelper();

    // FUNCTION 1: fillForm - function that fills the form with values from the submission object
    // PRECONDITIONS (1 parameter):
    // 1.) submission: an object containing lots of information about a submission
    // POSTCONDITIONS (1 possible outcome):
    // using data from the submission object, we fill the form values
    const fillForm = submission => {
        setForm({ ...form, values: {
            submitted_at: dateB2F(submission.details.submitted_at),
            region_id: submission.details.region.id.toString(),
            monkey_id: submission.details.monkey.id.toString(),
            proof: submission.details.proof,
            live: submission.details.live,
            comment: submission.details.comment,
            message: ""
        }});
    };

    // FUNCTION 2: handleChange - code that executes each time the user makes a change to the form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the form
    // POSTCONDITIONS (2 possible outcomes):
    // if the field id is live, we use the checked variable rather than the value variable to update the form
	// otherwise, we simply update the form field based on the value variable
    const handleChange = e => {
        // get variables from e.target
        const { id, value, checked } = e.target;

        // special case: updating the live field
        if (id === "live") {
            setForm({ ...form, values: { ...form.values, [id]: checked } });
        }

        // general case: updating a field
        else {
            setForm({ ...form, values: { ...form.values, [id]: value } })
        }
    };

    // FUNCTION 3: handleClose - function that runs to close the component
    // PRECONDITIONS (1 parameter):
    // 1.) setPopup - a state function that we can use to close the popup, since a popup will only render if the popup
    // state is defined
    // POSTCONDITIONS (1 possible outcome):
    // the form is set back to it's default values, and the popup is closed
    const handleClose = setPopup => {
        setForm(defaultForm);
        setShowReject(false);
        setPopup(null);
    };

    // FUNCTION 4: isFormUnchanged - function that checks whether or not the form was unchanged
    // PRECONDITIONS (1 parameter):
    // 1.) submission - our original submission object
    // POSTCONDITIONS (2 possible outcomes):
    // if not a single form value is different than the value in submission, we return true
    // otherwise, return false
    const isFormUnchanged = (submission) => {
        return form.values.submitted_at === dateB2F(submission.details.submitted_at)
            && form.values.region_id === submission.details.region.id.toString()
            && form.values.monkey_id === submission.details.monkey.id.toString()
            && form.values.proof === submission.details.proof
            && form.values.live === submission.details.live
            && form.values.comment === submission.details.comment;
    };

    // FUNCTION 5: handleSubmit - function that runs when the user submits the approval form
    // PRECONDITIONS (5 parameters):
    // 1.) e: an event object generated when the user submits the form
    // 2.) action: a string, either "approve" or "delete"
    // 3.) submission - our original submission object, which we will potentially have to update using the form values
    // 4.) dispatchRecent - a function used to update the recent reducer in `Approvals.jsx`
    // 5.) setPopup - a state function used to close the popup
    // POSTCONDITIONS (2 possible outcome):
    // if the form values are validated, than the recent reducer is updated with a new submission object, which includes
    // an `action` field, which specifies what should be done to the submission object, as well as potentially other updated fields
    // otherwise, the function will return early, and update the error field of the 
    const handleSubmit = (e, action, submission, dispatchRecent, setPopup) => {
        // first, prevent default action when a form submits (page reload)
        e.preventDefault();

        // if the action is delete, or the action is approve and the form is unchanged, we can essentially just remove the
        // submission from recent (which adds the submission to checked array)
        if (action === "delete" || (action === "approve" && isFormUnchanged(submission))) {
            dispatchRecent({ 
                type: "delete", 
                payload: {
                    ...submission, 
                    action: action,
                    message: form.values.message
                } 
            });
        }

        // otherwise, we need to validate the form values. if the validation is a success, we can remove the submission
        // from recent, with updated fields
        else {
            // create an error object that will store error messages for each field value that needs to
            // be validated
            const error = {};
            Object.keys(form.error).forEach(field => error[field] = undefined);

            // validate necessary fields
            error.proof = validateProof(form.values.proof);
            error.comment = validateComment(form.values.comment);
            error.message = validateMessage(form.values.message, false);

            // if any fields returned an error, let's render a message, update the `error.fields` object by calling the setForm() function,
            // and return early
            if (Object.values(error).some(row => row !== undefined)) {
                setForm({ ...form, error: error });
                addMessage("One or more form fields had errors.", "error");
                return;
            }

            // finally, if the fields were successfully validated, we can call the dispatchRecent function, and update any necessary
            // fields
            const checkedSubmission = {
                ...submission,
                action: "update",
                details: {
                    ...submission.details,
                    comment: form.values.comment,
                    live: form.values.live,
                    monkey: {
                        ...submission.details.monkey,
                        id: parseInt(form.values.monkey_id)
                    },
                    proof: form.values.proof,
                    region: {
                        ...submission.details.region,
                        id: parseInt(form.values.region_id)
                    },
                    submitted_at: getDateOfSubmission(form.values.submitted_at, submission.details.submitted_at)
                }
            };
            dispatchRecent({ type: "delete", payload: checkedSubmission });
        }

        // finally, close the popup
        handleClose(setPopup);
    };

    return { form, showReject, setShowReject, fillForm, handleChange, handleClose, handleSubmit };
};

/* ===== EXPORTS ===== */
export default SubmissionPopup;