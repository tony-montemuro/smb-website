/* ===== IMPORTS ===== */
import { MessageContext } from "../../../utils/Contexts";
import { useContext, useState } from "react";
import EmailLogin from "../../../database/authentication/EmailLogin";
import ValidationHelper from "../../../helper/ValidationHelper";

const EmailInfoForm = () => {
    /* ===== VARIABLES ===== */
    const defaultEmailState = { name: "", error: undefined, submitting: false };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES  ===== */
    const [email, setEmail] = useState(defaultEmailState);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { validateEmail } = ValidationHelper();

    // database functions
    const { updateEmail } = EmailLogin();

    // FUNCTION 1: handleChange - handle changes to the email form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the email form
    // POSTCONDITIONS (1 possible outcome):
    // the `name` field of the email state hook is updated based on e.value
    const handleChange = (e) => {
        const { value } = e.target;
        setEmail({ ...email, name: value });
    };

    // FUNCTION 2: handleEmailUpdate - handles an attempt at updating the email
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user submits the email form
    // POSTCONDITIONS (3 possible outcome):
    // if the email is not valid, the function will terminate early, and the error field of the email state hook will update. 
    // if the function successfully begins email updating process, and any email error is removed.
    // if the function fails to begin the email updating process, the user is alerted of the error.
    const handleEmailUpdate = async (e) => {
        // initialize login process
        e.preventDefault();

        // validate that the email is correct
        const error = validateEmail(email.name);
        if (error) {
            setEmail({ ...email, error: error });
            addMessage(error, "error");
            return;
        }

        // if we made it past validation, we can begin the email update process
        try {
            // set submitting to true, and await query to database
            setEmail({ ...email, submitting: true });
            await updateEmail(email.name);

            // if there are no errors, we can complete the function
            addMessage(`An email has been sent to both your current address, as well as ${ email.name }.`, "success");
            setEmail({ ...email, error: undefined, submitting: false });

        } catch (error) {
            addMessage(error.message, "error");
            setEmail({ ...email, error: error.message, submitting: false });
        }
    };

    return { email, handleChange, handleEmailUpdate };
};

/* ===== EXPORTS ===== */
export default EmailInfoForm;