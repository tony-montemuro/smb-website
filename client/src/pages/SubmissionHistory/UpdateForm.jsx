/* ===== IMPORTS ===== */
import { GameContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import UpdateFormLogic from "./UpdateForm.js";

function UpdateForm({ submission, profile }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const type = path[4];
  const levelName = path[5];
  const TEXT_AREA_ROWS = 2;

  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { form, clearToggle, fillForm, handleChange, handleToggle, handleSubmit } = UpdateFormLogic();

  // helper functions
  const { dateB2F } = FrontendHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when updatePopup is modified
  useEffect(() => {
    if (submission) {
      fillForm(submission, profile, type, levelName); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]); 
  
  /* ===== UPDATE POPUP ===== */
  return submission && form.values &&
    <div className="submission-history-update">

      { /* Form header */ }
      <h2>Update Submission</h2>
      <p>Make changes to any modifiable fields here.</p>

      { /* Update submission form */ }
      <form onSubmit={ (e) => handleSubmit(e, submission, profile) }>

        { /* Submission date input: allows the user to modify the date the submission was achieved. */ }
        <div className="submission-history-input-group">
          <label htmlFor="submitted_at">Date: </label>
          <input 
            id="submitted_at" 
            type="date" 
            min={ game.release_date } 
            max={ dateB2F() }
            value={ form.values.submitted_at }
            onChange={ (e) => handleChange(e) }
          />
        </div>

        { /* Submission region input: allows the user to select the region of the submission from a dropdown. */ }
        <div className="submission-history-input-group">
          <label htmlFor="region_id">Region: </label>
          <select id="region_id" value={ form.values.region_id } onChange={ (e) => handleChange(e) }>
            { game.region.map(region => (
              <option key={ region.id } value={ region.id }>{ region.region_name }</option>
            ))}
          </select>
        </div>

        { /* Submission monkey input: allows the user to select the monkey of the submission from a dropdown. */ }
        <div className="submission-history-input-group">
          <label htmlFor="monkey_id">Monkey: </label>
          <select id="monkey_id" value={ form.values.monkey_id } onChange={ (e) => handleChange(e) }>
            { game.monkey.map((monkey) => (
              <option key={ monkey.id } value={ monkey.id }>{ monkey.monkey_name }</option>
            ))}
          </select>
        </div>

        { /* Submission proof input: allows the user to modify the proof of submission. */ }
        <div className="submission-history-input-group">
          <label htmlFor="proof">Proof: </label>
          <input 
            id="proof"
            type="url"
            value={ form.values.proof }
            onChange={ (e) => handleChange(e) }
          />

          { /* If the error.proof field is defined, render that underneath the proof field. */ }
          { form.error.proof && <p>{ form.error.proof }</p> }

        </div>

        { /* Submission live checkbox: allows the user to specify whether or not the submission proof was live or not. */ }
        <div className="submission-history-input-group">
          <label htmlFor="live">Live Proof: </label>
          <input
            id="live"
            type="checkbox"
            checked={ form.values.live }
            onChange={ (e) => handleChange(e) }
          />
        </div>

        { /* Submission comment input: allows the user to modify the submission comment. */ }
        <div className="submission-history-textarea-group">
          <label htmlFor="comment">Comment (optional): </label>
          <textarea 
            id="comment"
            value={ form.values.comment }
            onChange={ (e) => handleChange(e) }
            rows={ TEXT_AREA_ROWS }
            readOnly={ true }
          >
          </textarea>

          { /* If the error.comment field is defined, render that underneath the proof field. */ }
          { form.error.comment && <p>{ form.error.comment }</p> }

        </div>

        { /* Comment toggle: a button that allows the moderator to clear the comment, if necessary */ }
        <div className="submission-history-popup-input">
          <label htmlFor="comment-toggle">Clear Comment: </label>
          <input 
            type="checkbox"
            checked={ clearToggle }
            onChange={ () => handleToggle(submission) }
          />
        </div>

        { /* Form submission button: submits the form. NOTE: button is disabled if the submitting field of form is true. */ }
        <div className="submission-history-submit-btn-wrapper">
          <button type="submit" disabled={ form.submitting }>Update Submission</button>
        </div>

      </form>
  
    </div>
    
};

/* ===== EXPORTS ===== */
export default UpdateForm;