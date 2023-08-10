/* ===== IMPORTS ===== */
import DeleteFormLogic from "./DeleteForm.js";

function DeleteForm({ submission, profile }) {
  /* ===== VARIABLES ===== */
  const TEXT_AREA_ROWS = 2;

  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { form, handleDelete, handleDeleteAndNotify, handleChange, isNotifyable } = DeleteFormLogic();

  /* ===== DELETE POPUP COMPONENT ===== */
  return (
    submission &&
    
    <div className="submission-history-delete">

      { /* Display information about the submission being deleted. */ }
      <h2>Delete Submission</h2>
      <p>If this submission cannot be salvaged, delete it here.</p>

      { /* Delete form (should only render if the submission is notifyable) */ }
      { isNotifyable(submission, profile) &&
        <form>

          { /* Message input - a text field where the user must include a message with their delete */ }
          <div className="submission-history-textarea-group">
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
      <div className="submission-history-decision-btns">
        <button 
          type="button" 
          onClick={ isNotifyable(submission, profile) ? () => handleDeleteAndNotify(submission, profile) : () => handleDelete(submission.id) }
        >
          Delete Submission
        </button>
      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default DeleteForm;