/* ===== IMPORTS ===== */
import { useState } from "react";
import EmailLogin from "../../database/authentication/EmailLogin";
import ValidationHelper from "../../helper/ValidationHelper";

const EmailUpdate = () => {
    /* ===== VARIABLES ===== */
    const defaultEmailState = { name: "", error: undefined };

    /* ===== STATES  ===== */
    const [email, setEmail] = useState({ name: "", error: undefined });
    const [userState, setUserState] = useState("idle");

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { validateEmail } = ValidationHelper();

    // database functions
    const { updateEmail } = EmailLogin();

    // FUNCTION 0: initForm
    const initForm = () => {
        setEmail(defaultEmailState);
    }

    // FUNCTION 1: handleChange - handle changes to the email form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the email form
    // POSTCONDITIONS (1 possible outcome):
    // the `name` field of the email state hook is updated based on e.value. then, the setUserState() function is called to
    // set the userState to "idle"
    const handleChange = (e) => {
        const { value } = e.target;
        setEmail({ ...email, name: value });
        setUserState("idle");
    };

    // FUNCTION 2: handleEmailUpdate - handles an attempt at updating the email
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user submits the email form
    // POSTCONDITIONS (3 possible outcome):
    // if the email is not valid, the function will terminate early, and the error field of the email state hook will update. 
    // if the function successfully begins email updating process, the user state is updated to complete by calling the
    // setUserState() function with the "complete" argument, and any email error is removed.
    // if the function fails to begin the email updating process, the user is alerted of the error.
    const handleEmailUpdate = async (e) => {
        // initialize login process
        e.preventDefault();
        setUserState("logging");

        // validate that the email is correct
        const error = validateEmail(email.name);
        if (error) {
            setEmail({ ...email, error: error });
            setUserState("idle");
            return;
        }

        // if we made it past validation, we can begin the email update process
        try {
            await updateEmail(email.name);

            // if there are no errors, we can complete the function
            setUserState("complete");
            setEmail({ ...email, error: undefined });

        } catch (error) {
            console.log(error);
            alert(error.message);
            setUserState("idle");
        }
    };

    return { email, userState, initForm, handleChange, handleEmailUpdate };
};

/* ===== EXPORTS ===== */
export default EmailUpdate;