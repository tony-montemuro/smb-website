/* ===== IMPORTS ===== */
import { AppDataContext, MessageContext, PopupContext } from "../../utils/Contexts";
import { isLowerAlphaNumericWithUnderscores } from "../../utils/RegexPatterns"; 
import { useContext, useState } from "react";
import Update from "../../database/update/Update.js";

const CategoryAddForm = (setSubmitting) => {
    /* ===== CONTEXTS ===== */

    // update categories function from app data context
    const { updateCategories } = useContext(AppDataContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);
    
    // close popup function from popup context
    const { closePopup } = useContext(PopupContext);

    /* ===== VARIABLES ===== */
    const valuesInit = {
        abb: "",
        name: "",
        practice: true
    };
    const formInit = {
        values: valuesInit,
        error: { abb: undefined }
    };

    /* ===== STATES ===== */
    const [form, setForm] = useState(formInit);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { insert } = Update();

    // FUNCTION 1: handleChange - code that is executed when the user makes a change to a form input
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object generated when the user updates the form
    // POSTCONDITIONS (1 possible outcome):
    // the form state is updated to match the change the user has made to the form
    const handleChange = e => {
        const { checked, id, value } = e.target;
        setForm({ 
            ...form, 
            error: formInit.error,
            values: { ...form.values, [id]: id === "practice" ? checked : value } 
        });
    };

    // FUNCTION 2: validateAbb - function that validates the abb form field
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string, which will correspond to abbreviation of a category in the DB (value that appears in URL)
    // POSTCONDITIONS (2 possible outcomes):
    // if the abb contains any upper-case letters, or non-underscore special characters, return a string that contains
    // the error message
    // if the abb is determined to be valid, return undefined
    const validateAbb = abb => {
        if (!isLowerAlphaNumericWithUnderscores.test(abb)) {
            return "Abbreviation must contain only lowercase letters, numbers, or underscores, and must start with a letter or number.";
        }
    };

    // FUNCTION 3: handleSubmit - code that is executed when the user submits the form
    // PRECONDITIONS (1 parameter):
    // 1.) e: the event object generated when the user submits the form
    // POSTCONDITIONS (3 possible outcomes):
    // if the form is invalid, this function returns early, and renders an error message
    // if the form is valid, but fails during async process, render an error message
    // if the form is valid, and async process is successful, render a success message, and close the popup
    const handleSubmit = async e => {
        e.preventDefault();
        
        // validate abb field
        const error = validateAbb(form.values.abb);
        if (error) {
            setForm({ ...form, error: { abb: error } });
            return;
        }

        setSubmitting(true);
        try {
            // attempt to submit
            await insert("category", form.values);
            await updateCategories();
            closePopup();
            addMessage(`New category was added! You should now be able to select it as an option.`, "success", 8000);

        } catch (error) {
            // render a different error if it's a unique constraint. otherwise, render generic error message
            if (error.code === "23505") {
                addMessage("A category exists with the same name and practice mode style!", "error", 10000);
            } else {
                addMessage("There was a problem adding the category. If the issue consists, the system may be experiencing an outage.", "error", 13000);
            }

        } finally {
            setSubmitting(false);
        };
    };

    return { form, handleChange, handleSubmit };
};

/* ===== EXPORTS ===== */
export default CategoryAddForm;