/* ===== IMPORTS ===== */
import { MessageContext } from "../../../utils/Contexts";
import { useContext, useState } from "react";
import Password from "../../../database/authentication/Password";

const PasswordForm = () => {
    /* ===== VARIABLES ===== */
    const defaultForm = {
        error: { confirmation: undefined, password: undefined },
        submitting: false,
        values: { confirmation: "", password: "" }
    };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [form, setForm] = useState(defaultForm);

    /* ===== FUNCTIONS ===== */
    const { updatePassword } = Password();

    // FUNCTION 1: handleChange - code that is executed each time the user makes changes to the password reset form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the form
    // POSTCONDITIONS (1 possible outcome):
    // using the `id` and `value` values from `e.target`, we can update the form with the updated values, as well
    // as resetting the error field when the user makes a change
    const handleChange = e => {
        const { id, value } = e.target;
        setForm({ 
            ...form, 
            values: { ...form.values, [id]: value }, 
            error: { ...form.error, [id]: undefined } 
        });
    };

    // FUNCTION 2: validateFields - code that validates the two form fields
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if their is at least one form error, this function will return an error object with at least one defined value
    // if both fields validate successfully, this function will return an error object with undefined values
    const validateFields = () => {
        const error = defaultForm.error;
        const nonMatching = "Passwords do not match.";
        if (form.values.password !== form.values.confirmation) {
            error.password = nonMatching;
            error.confirmation = nonMatching;
        }
        return error;
    };

    // FUNCTION 3: handleReset - code that fires when the user attempts to reset their password
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user submits the password reset form
    // POSTCONDITIONS (3 possible outcomes):
    // if the form fails to validate, this function will update the error state of the form object, and return early
    // if the form validates, but the query to reset the password fails, this function will render an error to the user
    // if the form validates, and the query to reset the password is successful, this function will render a success message,
    // and the user will be able to log in with their new password
    const handleSubmit = async e => {
        e.preventDefault();

        // first, let's perform basic validation of the passwords before we even attempt to update
        const error = validateFields(form.values.password, form.values.confirmation);
        if (Object.keys(error).some(key => error[key])) {
            setForm({ ...form, error });
            return;
        }

        // if we made it past validation, attempt to update the password
        setForm({ ...form, submitting: true });
        try {
            await updatePassword(form.values.password);
            addMessage("Password was successfully reset!", "success", 5000);
        } catch (error) {
            addMessage(error.message, "error", 10000);
        } finally {
            setForm({ ...form, submitting: false });
        }
    };

    return { form, handleChange, handleSubmit };
};

/* ===== EXPORTS ===== */
export default PasswordForm;