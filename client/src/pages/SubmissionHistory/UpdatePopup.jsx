/* ===== IMPORTS ===== */
import { GameContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import UpdatePopupLogic from "./UpdatePopup.js";
import Username from "../../components/Username/Username";

function UpdatePopup({ submission, setSubmission, profile }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const type = path[4];
  const levelName = path[5];
  const TEXT_AREA_ROWS = 5;

  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { form, fillForm, handleChange, isNotifyable, handleSubmit, closePopup } = UpdatePopupLogic();

  // helper functions
  const { capitalize, recordB2F, dateB2F } = FrontendHelper();

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
    <div className="submission-history-popup">
      <div className="submission-history-popup-inner">

        { /* Close popup button */ }
        <div className="submission-history-popup-close-btn">
           <button type="button" onClick={ () => closePopup(setSubmission) } disabled={ form.submitting }>Close</button>
        </div>

        { /* Levelboard update */ }
        <div className="submission-history-update-wrapper">
          <div className="submission-history-update">

            { /* Form header */ }
            <h2>Update Submission</h2>

            { /* Update submission form */ }
            <form onSubmit={ (e) => handleSubmit(e, submission, profile) }>

              { /* Submission user: display the username of the person who submitted the submission. */ }
              <div className="submission-history-input-group">
                <span>User:&nbsp;
                  <Username country={ profile.country.iso2 } profileId={ profile.id } username={ profile.username } />
                </span>
              </div>

              { /* Submission record: simply display the record, which is not able to be changed in this input. */ }
              <div className="submission-history-input-group">
                <span>{ capitalize(type) }: { recordB2F(submission.record, type) }</span>
              </div>

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
                >
                </textarea>


                { /* If the error.comment field is defined, render that underneath the proof field. */ }
                { form.error.comment && <p>{ form.error.comment }</p> }

              </div>

              { /* Submission message input: allows user to include a message with the update, since users will recieve a
              notification when a moderator updates a submission on behalf of them. The message is included in this.
              NOTE: This input form should only render if the submission is "notifyable". */ }
              { isNotifyable(submission, profile) &&
                <div className="submission-history-textarea-group">
                  <label htmlFor="message">Leave a message (optional): </label>
                  <textarea 
                    id="message"
                    value={ form.values.message }
                    onChange={ (e) => handleChange(e) }
                    rows={ TEXT_AREA_ROWS }
                  >
                  </textarea>

                  { /* If the error.message field is defined, render that underneath the proof field. */ }
                  { form.error.message  && <p>{ form.error.message }</p> }
                </div>
              }

              { /* Form submission button: submits the form. NOTE: button is disabled if the submitting field of form is true. */ }
              <div className="submission-history-submit-btn-wrapper">
                <button type="submit" disabled={ form.submitting }>Update</button>
              </div>

            </form>

          </div>
        </div>
  
      </div>
    </div>
    
};

/* ===== EXPORTS ===== */
export default UpdatePopup;