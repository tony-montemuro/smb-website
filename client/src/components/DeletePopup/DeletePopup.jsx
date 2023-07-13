/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";
import DeletePopupLogic from "./DeletePopup.js";
import FrontendHelper from "../../helper/FrontendHelper";
import Username from "../Username/Username";

function DeletePopup({ submission, setSubmission, profile }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const type = location.pathname.split("/")[4];
  const TEXT_AREA_ROWS = 2;

  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { form, handleDelete, handleDeleteAndNotify, handleChange, isNotifyable, closePopup } = DeletePopupLogic();

  // helper functions
  const { recordB2F } = FrontendHelper();

  /* ===== DELETE POPUP COMPONENT ===== */
  return (
    submission &&
    
    <div className="levelboard-popup">
      <div className="levelboard-popup-inner">

        { /* Display information about the submission being deleted. */ }
        <h2>Are you sure you want to remove the following { type }: { recordB2F(submission.record, type) } by&nbsp; 
        <Username country={ profile.country.iso2 } id={ profile.id } username={ profile.username } />?</h2>
        
        { /* Delete form (should only render if the submission is notifyable) */ }
        { isNotifyable(submission, profile) &&
          <form>

            { /* Message input - a text field where the user must include a message with their delete */ }
            <div className="levelboard-textarea-group">
              <label>Leave a message: </label>
              <textarea 
                value={ form.message }
                onChange={ (e) => handleChange(e) }
                rows={ TEXT_AREA_ROWS }
              >
              </textarea>
            </div>                

            { /* Render the form error under this input, if an error is defined */ }
            { form.error && <p>{ form.error }</p> }

          </form>
        }

        { /* Button to delete the submission, and a button to close the popup */ }
        <div className="levelboard-decision-btns">
          <button type="button" onClick={ () => closePopup(setSubmission) }>No</button>
          <button 
            type="button" 
            onClick={ isNotifyable(submission, profile) ? () => handleDeleteAndNotify(submission, profile) : () => handleDelete(submission.id) }
          >
            Yes
          </button>
        </div>

      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default DeletePopup;