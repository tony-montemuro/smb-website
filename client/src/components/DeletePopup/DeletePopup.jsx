/* ===== IMPORTS ===== */
import { useContext } from "react";
import { UserContext } from "../../Contexts";
import DeletePopupLogic from "./DeletePopup.js";

function DeletePopup({ submission, setSubmission }) {
  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== STATES & FUNCTIONS ===== */
  const { form, handleOwnDelete, handleDelete, handleChange, closePopup } = DeletePopupLogic();

  /* ===== DELETE POPUP COMPONENT ===== */
  return (
    submission &&

      // If the submission being deleted belongs to the current user, render this popup.
      (submission.user_id === user.id ?
        <div className="levelboard-popup">
          <div className="levelboard-popup-inner">

            { /* Simple popup that gives the user the choice of removing the submission, or closing the popup. */ }
            <h2>Are you sure you want to remove your submission?</h2>
            <button onClick={ () => handleOwnDelete(submission.id) }>Yes</button>
            <button onClick={ () => closePopup(setSubmission) }>No</button>

          </div> 
        </div>
      :

        // Otherwise, render this popup
        <div className="levelboard-popup">
          <div className="levelboard-popup-inner">

              { /* Display information about the submission being deleted. */ }
              <h2>Are you sure you want to remove the following { submission.type }: { submission.record } by { submission.username }?</h2>
              
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

          </div>
        </div>)
  );
};

/* ===== EXPORTS ===== */
export default DeletePopup;