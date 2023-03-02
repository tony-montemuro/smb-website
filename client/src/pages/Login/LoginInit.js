import { useState } from "react";
import EmailLogin from "../../database/authentication/EmailLogin";
import LoginHelper from "../../helper/LoginHelper";

const LoginInit = () => {
    /* ===== STATES  ===== */
    const [email, setEmail] = useState({ name: "", error: undefined });
    const [userState, setUserState] = useState("idle");

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { validateEmail } = LoginHelper();
    const { login } = EmailLogin();

    // FUNCTION 1: handleChange - handle changes to the email form
    // PRECONDITINOS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the email form
    // POSTCONDITIONS:
    // the `name` field of the email state hook is updated based on e.value, and the userState state hook
    // is set to "idle"
    const handleChange = (e) => {
        const { value } = e.target;
        setEmail({ ...email, name: value });
        setUserState("idle");
    };

    // FUNCTION 2: handleLogin - handles an attempt at logging in
    // PRECONDITINOS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the email form
    // POSTCONDITIONS:
    // the function will attempt to validate the email, and log the user in. if the email is not valid, the function
    // will terminate early, and the error field of the email state hook will update. otherwise, the function will attempt
    // to log the user in.
    // function that is called when the user attempts to log-in
    const handleLogin = async (e) => {
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

        // if we made it past validation, we can complete the login
        try {
            await login(email.name);

            // if there are no errors, we can complete the function
            setUserState("complete");

        } catch (error) {
            console.log(error);
            alert(error.message);
            setUserState("idle");
        }
    };

    return { 
        email,
        userState,
        handleChange, 
        handleLogin 
    };
}

export default LoginInit;