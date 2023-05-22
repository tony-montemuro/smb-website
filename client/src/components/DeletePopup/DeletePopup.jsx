/* ===== IMPORTS ===== */
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../Contexts";
import DeletePopupLogic from "./DeletePopup.js";
import FrontendHelper from "../../helper/FrontendHelper";
import Username from "../Username/Username";

function DeletePopup({ submission, setSubmission }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const type = location.pathname.split("/")[4];

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { form, handleOwnDelete, handleDelete, handleChange, closePopup } = DeletePopupLogic();

  // helper functions
  const { recordB2F } = FrontendHelper();

  /* ===== DELETE POPUP COMPONENT ===== */
  return (
    submission &&
    
    <div className="levelboard-popup">
      <div className="levelboard-popup-inner">
        { parseInt(submission.profile.id) === user.profile.id ?

          // If the submission being deleted belongs to the current user, render this popup.
          <>
            { /* Simple popup that gives the user the choice of removing the submission, or closing the popup. */ }
            <h2>Are you sure you want to remove your submission?</h2>
            <button onClick={ () => handleOwnDelete(submission.details.id) }>Yes</button>
            <button onClick={ () => closePopup(setSubmission) }>No</button>
          </>
        :

          // Otherwise, render this popup
          <>
            { /* Display information about the submission being deleted. */ }
              <h2>Are you sure you want to remove the following { type }: { recordB2F(submission.details.record, type) } by&nbsp; 
              <Username country={ submission.profile.country } id={ submission.profile.id } username={ submission.profile.username } />?</h2>
              
              { /* Delete form */ }
              <form>

              { /* Message input - a text field where the user must include a message with their delete */ }
                <label>Leave a message: </label>
                <input 
                  type="text"
                  value={ form.message }
                  onChange={ (e) => handleChange(e) }
                />

                { /* Render the form error under this input, if an error is defined */ }
                { form.error && <p>{ form.error }</p> }

              </form>

              { /* Button to delete the submission, and a button to close the popup */ }
              <button onClick={ () => handleDelete(submission) }>Yes</button>
              <button onClick={ () => closePopup(setSubmission) }>No</button>
          </>

        }
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default DeletePopup;