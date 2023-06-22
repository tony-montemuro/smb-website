/* ===== IMPORTS ===== */
import { MessageContext } from "../../Contexts";
import { useContext, useState } from "react";
import EmailLogin from "../../database/authentication/EmailLogin";
import ValidationHelper from "../../helper/ValidationHelper";

const Login = () => {
    /* ===== STATES  ===== */
    const [email, setEmail] = useState({ name: "" });
    const [submitting, setSubmitting] = useState(false);

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { validateEmail } = ValidationHelper();

    // database functions
    const { login } = EmailLogin();

    // FUNCTION 1: handleChange - handle changes to the email form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the email form
    // POSTCONDITIONS (1 possible outcome):
    // the `name` field of the email state hook is updated based on e.value
    const handleChange = (e) => {
        const { value } = e.target;
        setEmail({ ...email, name: value });
    };

    // FUNCTION 2: handleLogin - handles an attempt at logging in
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the email form
    // POSTCONDITIONS (3 possible outcome):
    // if the email is not valid, the function will terminate early, and an error message will be rendered to the user. 
    // if the function successfully logs in, the user is informed to check their email inbox
    // if the function fails to login, the user is informed of the error
    const handleLogin = async (e) => {
        // initialize login process
        e.preventDefault();

        // validate that the email is correct
        const error = validateEmail(email.name);
        if (error) {
            addMessage(error, "error");
            return;
        }

        // if we made it past validation, we can complete the login
        try {
            // set the submitting flag to true, and attempt to log in
            setSubmitting(true);
            await login(email.name);

            // if login was successful, render a success message
            addMessage("Please check your email inbox to proceed.", "success");

        } catch (error) {
            // if there was an error, render it
            addMessage(error.message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    return { 
        email,
        submitting,
        handleChange, 
        handleLogin 
    };
}

/* ===== EXPORTS ===== */
export default Login;