/* ===== IMPORTS ===== */
import { useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";

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

    /* ===== STATES ===== */
    const [form, setForm] = useState(defaultForm);

    /* ===== FUNCTIONS ===== */
    
    // helper functions
    const { dateB2F } = FrontendHelper();

    // FUNCTION 1: fillForm - function that fills the form with values from the submission object
    // PRECONDITIONS (1 parameter):
    // 1.) submission: an object containing lots of information about a submission
    // POSTCONDITIONS (1 possible outcome):
    // using data from the submission object, we fill the form values
    const fillForm = submission => {
        setForm({ ...form, values: {
            submitted_at: dateB2F(submission.details.submitted_at),
            region_id: submission.details.region.id,
            monkey_id: submission.details.monkey.id,
            proof: submission.details.proof,
            live: submission.details.live,
            message: null
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
        setPopup(null);
    };

    return { form, fillForm, handleChange, handleClose };
};

/* ===== EXPORTS ===== */
export default SubmissionPopup;