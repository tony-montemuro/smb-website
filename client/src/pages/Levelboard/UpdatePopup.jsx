/* ===== IMPORTS ===== */
import { GameContext, UserContext } from "../../Contexts";
import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import UpdatePopupLogic from "./UpdatePopup.js";
import Username from "../../components/Username/Username";

function UpdatePopup({ submission, setSubmission }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const type = path[4];
  const levelName = path[5];
  const profile = submission ? submission.profile : null;

  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { form, fillForm, handleChange, handleSubmit, closePopup } = UpdatePopupLogic();

  // helper functions
  const { capitalize, recordB2F, dateB2F } = FrontendHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when updatePopup is modified
  useEffect(() => {
    if (submission) {
      fillForm(submission, type, levelName); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]); 
  
  /* ===== UPDATE POPUP ===== */
  return submission && form.values &&
    <div className="levelboard-popup">
      <div className="levelboard-popup-inner">

        { /* Close popup button */ }
        <div className="report-levelboard-popup">
          <button onClick={ () => closePopup(setSubmission) }>Close</button>
        </div>

        { /* Levelboard update */ }
        <div className="levelboard-update">

          { /* Form header */ }
          <h2>Update Submission</h2>

          { /* Form description - explains the distinction between updating a submission, and inserting a new one */ }
          <p><i>This form is for updating the details of an existing submission. If you wish to submit a new { type }, please press
          the</i> <b>Submit a Score</b> <i>button.</i></p>

          { /* Update submission form */ }
          <form onSubmit={ (e) => handleSubmit(e, submission) }>

            { /* Submission user: display the username of the submission, if the owner of the submission is NOT the same
            as the current user. this will only ever show up for moderators. */ }
            { user.profile.id !== profile.id && 
              <span>User:&nbsp;
                <Username country={ profile.country } profileId={ profile.id } username={ profile.username } />
              </span>
            }

            { /* Submission record: simply display the record, which is not able to be changed in this input. */ }
            <p>{ capitalize(type) }: { recordB2F(submission.details.record) }</p>

            { /* Submission date input: allows the user to modify the date they achieved their submission. */ }
            <div className="levelboard-input-group">
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

            { /* Submission region input: allows the user to select the region they achieved their submission on from a dropdown. */ }
            <div className="levelboard-input-group">
              <label htmlFor="region_id">Region: </label>
              <select id="region_id" value={ form.values.region_id } onChange={ (e) => handleChange(e) }>
                { game.region.map(region => (
                  <option key={ region.id } value={ region.id }>{ region.region_name }</option>
                ))}
              </select>
            </div>

            { /* Submission monkey input: allows the user to select the monkey they achieved their submission on from a dropdown. */ }
            <div className="levelboard-input-group">
              <label htmlFor="monkey_id">Monkey: </label>
              <select id="monkey_id" value={ form.values.monkey_id } onChange={ (e) => handleChange(e) }>
                { game.monkey.map((monkey) => (
                  <option key={ monkey.id } value={ monkey.id }>{ monkey.monkey_name }</option>
                ))}
              </select>
            </div>

            { /* Submission proof input: allows the user to modify the proof of submission. */ }
            <div className="levelboard-input-group">
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

            { /* Submission comment input: allows the user to modify their submission comment. */ }
            <div className="levelboard-input-group">
              <label htmlFor="comment">Comment (optional): </label>
              <input 
                id="comment"
                type="text"
                value={ form.values.comment }
                onChange={ (e) => handleChange(e) }
              />

              { /* If the error.comment field is defined, render that underneath the proof field. */ }
              { form.error.comment && <p>{ form.error.comment }</p> }

            </div>

            { /* Submission live checkbox: allows the user to specify whether or not the submission was live or not. */ }
            <div className="levelboard-input-group">
              <label htmlFor="live">Live Run: </label>
              <input
                id="live"
                type="checkbox"
                checked={ form.values.live }
                onChange={ (e) => handleChange(e) }
              />
            </div>

            { /* Submission message input: allows a moderator to include a message for the submission, since users will recieve a
            notification when a moderator submits or updates a submission on behalf of them. The message is included in this.
            NOTE: This input form should only render if the current user is a moderator, and the form user is different than the mod. */ }
            { user.is_mod && user.profile.id !== form.values.profile_id &&
              <div className="levelboard-input-group">
                <label htmlFor="message">Leave a message (optional): </label>
                <input 
                  id="message"
                  type="text"
                  value={ form.values.message }
                  onChange={ (e) => handleChange(e) }
                />

                { /* If the error.message field is defined, render that underneath the proof field. */ }
                { form.error.message  && <p>{ form.error.message }</p> }
              </div>
            }

            { /* Form submission button: submits the form. NOTE: button is disabled if the submitting field of form is true. */ }
            <button disabled={ form.submitting }>Update</button>

          </form>

        </div>
  
      </div>
    </div>
    
};

/* ===== EXPORTS ===== */
export default UpdatePopup;