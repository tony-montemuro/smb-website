/* ===== IMPORTS ===== */
import "./EmailUpdate.css";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageContext, UserContext } from "../../Contexts";
import EmailUpdateLogic from "./EmailUpdate.js";

function EmailUpdate() {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES AND FUNCTIONS ====== */

  // states and functions from the js file
  const { 
    email, 
    userState,
    initForm,
    handleChange,
    handleEmailUpdate
  } = EmailUpdateLogic();

  /* ===== EFFECTS ===== */

  // code that is executed to validate that the current user is authenticated, since this page is for authenticated users only
  useEffect(() => {
    if (user.id !== undefined) {
      // if not user.id (meaning user is null), current user is not authenticated. thus, deny
      // access to this page.
      if (!user.id) {
        addMessage("Invalid access.", "error");
        navigate("/");
        return;
      }

      // initialize form
      initForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ===== EMAIL UPDATE COMPONENT ===== */
  return email ?
    <div className="email-update-container">
      <div className="email-update">

        { /* Email Update header */ }
        <div className="email-update-header">
          <h1>Update Email</h1>
          <p>Enter new email below: </p>
        </div>

        { /* Email Update form: allows user to sign in via email account */ }
        <div className="email-update-form">
          <form onSubmit={ handleEmailUpdate }>
            <div>

              { /* Email input: a place for the user to enter their email account */ }
              <label htmlFor="email">Email: </label>
              <input 
                id="email"
                type="email"
                placeholder="Your new email"
                value={ email.name }
                onChange={ handleChange } 
              />
            </div>

            { /* If there was an error logging in, render it here. */ }
            { email.error && <p>Error: { email.error }</p> }

            { /* Form button: When pressed, the application will attempt to log the user in.
            If the application is in the processing of logging in, the button will be disabled. */ }
            <button disabled={ userState === "logging" }>Update</button>

            { /* If the login was a success, render a confirmation message here. */ }
            { userState === "complete" && <p>Success! Please check both your current & new email to continue.</p> }

          </form>
        </div>

      </div>

    </div>
  :
    // Loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default EmailUpdate;