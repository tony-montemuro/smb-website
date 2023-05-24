/* ===== IMPORTS ===== */
import { MessageContext } from "../../Contexts";
import { useContext, useState } from "react";
import EmailLogin from "../../database/authentication/EmailLogin";
import ValidationHelper from "../../helper/ValidationHelper";

const Login = () => {
    /* ===== STATES  ===== */
    const [email, setEmail] = useState({ name: "", error: undefined });
    const [userState, setUserState] = useState("idle");

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
    // the `name` field of the email state hook is updated based on e.value. then, the setUserState() function is called to
    // set the userState to "idle"
    const handleChange = (e) => {
        const { value } = e.target;
        setEmail({ ...email, name: value });
        setUserState("idle");
    };

    // FUNCTION 2: handleLogin - handles an attempt at logging in
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the email form
    // POSTCONDITIONS (1 possible outcome):
    // if the email is not valid, the function will terminate early, and the error field of the email state hook will update. 
    // if the function successfully begins the login process, the user state is updated to complete by calling the
    // setUserState() function with the "complete" argument, and any email error is removed.
    // if the function fails to begin the login process, the user is alerted of the error.
    const handleLogin = async (e) => {
        // initialize login process
        e.preventDefault();
        setUserState("logging");

        // validate that the email is correct
        const error = validateEmail(email.name);
        if (error) {
            setEmail({ ...email, error: error });
            addMessage(error, "error");
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
            addMessage(error.message, "error");
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