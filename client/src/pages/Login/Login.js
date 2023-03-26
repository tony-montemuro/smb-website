/* ===== IMPORTS ===== */
import { useState } from "react";
import EmailLogin from "../../database/authentication/EmailLogin";

const Login = () => {
    /* ===== STATES  ===== */
    const [email, setEmail] = useState({ name: "", error: undefined });
    const [userState, setUserState] = useState("idle");

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { login } = EmailLogin();

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

    // FUNCTION 2: validateEmail - determine if email is valid for login attempt
    // PRECONDITIONS (1 parameter):
    // 1.) email: a string that represents the email of the user attempting to login
    // POSTCONDITIONS (1 possible outcome, 1 return):
    // 1.) error: a string that gives information as to why their is an issue with the email
    const validateEmail = email => {
        // initialize variables used in validation process
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

        // first, validate that the email exists
        if (!email || email.length === 0) {
            return "Error: Email is required.";
        }

        // next, validate that email is well-formatted
        if (!emailRegex.test(email)) {
            return "Error: Invalid email format.";
        }

        return undefined;
    };

    // FUNCTION 3: handleLogin - handles an attempt at logging in
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the email form
    // POSTCONDITIONS (1 possible outcome):
    // the function will attempt to validate the email, and log the user in. if the email is not valid, the function
    // will terminate early, and the error field of the email state hook will update. otherwise, the function will attempt
    // to log the user in.
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
            setEmail({ ...email, error: undefined });

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

/* ===== EXPORTS ===== */
export default Login;