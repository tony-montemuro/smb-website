/* ===== IMPORTS ===== */
import "./Levelboard.css";
import { GameContext, StaticCacheContext, UserContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import InsertPopupLogic from "./InsertPopup.js";
import RecordInput from "./RecordInput";

function InsertPopup({ popup, setPopup, level, submissions }) {
  /* ===== CONTEXTS ===== */

	// static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  // game state from game context
  const { game } = useContext(GameContext);

	// user state from user context
  const { user } = useContext(UserContext);

  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const type = path[4];
  const profiles = staticCache.profiles;
  const TEXT_AREA_ROWS = 5;
  const TEXT_AREA_COLS = 20;

  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { form, fillForm, handleChange, handleSubmit, closePopup } = InsertPopupLogic(); 
  
  // helper functions
  const { capitalize, dateB2F } = FrontendHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, and when the popup state is changed
  useEffect(() => {
    if (popup) {
      fillForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup]);

  /* ===== FORM POPUP COMPONENT ===== */ 
  return popup && form.values &&
    <div className="levelboard-popup">
      <div className="levelboard-popup-inner">
        
        { /* Close popup button */ }
        <div className="levelboard-popup-close-btn">
          <button type="button" onClick={ () => closePopup(setPopup) } disabled={ form.submitting }>Close</button>
        </div>

        { /* Levelboard submit - contains the form header and form for submitting submissions to the database */ }
        <div className="levelboard-submit-wrapper">
          <div className="levelboard-submit">

            { /* Form header - specifies the type of submission */ }
            <h2>Submit a New { capitalize(type) }</h2>

            { /* Submission form - allows users to submit a record to the database */ }
            <form onSubmit={ (e) => handleSubmit(e, submissions, level.timer_type) }>

              { /* User input: allows a moderator to select which user they want to submit on behalf of from a dropdown menu. 
              NOTE: this form input is reserved for moderators only! */ }
              { user.is_mod &&
                <div className="levelboard-input-group">
                  <label htmlFor="profile_id">User: </label>
                  <select id="profile_id" value={ form.values.profile_id } onChange={ (e) => handleChange(e) }>
                    { profiles.map((profile) => (
                      <option key={ profile.id } value={ profile.id }>{ profile.username }</option>
                    ))}
                  </select>
                </div>
              }

              <RecordInput form={ form } handleChange={ handleChange } timerType={ level.timer_type } />

              { /* Submission date input: allows the user to input the date they achieved their submission. */ }
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

              { /* Submission monkey input: allows the user to select the monkey they achieved their submission on from a dropdown. */ }
              <div className="levelboard-input-group">
                <label htmlFor="monkey_id">Monkey: </label>
                <select id="monkey_id" value={ form.values.monkey_id } onChange={ (e) => handleChange(e) }>
                  { game.monkey.map(monkey => (
                    <option key={ monkey.id } value={ monkey.id }>{ monkey.monkey_name }</option>
                  ))}
                </select>
              </div>

              { /* Submission platform input: allows the user to select the platform they achieved their submission on from a dropdown. */ }
              <div className="levelboard-input-group">
                <label htmlFor="platform_id">Platform: </label>
                <select id="platform_id" value={ form.values.platform_id } onChange={ (e) => handleChange(e) }>
                  { game.platform.map(platform => (
                    <option key={ platform.id } value={ platform.id }>{ platform.platform_name }</option>
                  ))}
                </select>
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

              { /* Submission proof input: allows the user to input the proof of submission. */ }
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

              { /* Submission live checkbox: allows the user to specify whether or not the submission was live or not. */ }
              <div className="levelboard-input-group">
                <label htmlFor="live">Live Proof: </label>
                <input
                  id="live"
                  type="checkbox"
                  checked={ form.values.live }
                  onChange={ (e) => handleChange(e) }
                />
              </div>

              { /* Submission comment input: allows the user to input a comment regarding their submission. */ }
              <div className="levelboard-textarea-group">
                <label htmlFor="comment">Comment (optional): </label>
                <textarea 
                  id="comment"
                  value={ form.values.comment }
                  onChange={ (e) => handleChange(e) }
                  disabled={ user.profile.id !== form.values.profile_id }
                  rows={ TEXT_AREA_ROWS }
                  cols={ TEXT_AREA_COLS }
                >
                </textarea>

                { /* If the error.comment field is defined, render that underneath the proof field. */ }
                { form.error.proof && <p>{ form.error.comment }</p> }

              </div>

              { /* Submission message input: allows a moderator to include a message for the submission, since users will recieve a
              notification when a moderator submits or updates a submission on behalf of them. The message is included in this.
              NOTE: This input form should only render if the current user is a moderator, and the form user is different than the mod. */ }
              { user.is_mod && user.profile.id !== form.values.profile_id &&
                <div className="levelboard-textarea-group">
                  <label htmlFor="message">Leave a message (optional): </label>
                  <textarea 
                    id="message"
                    value={ form.values.message }
                    onChange={ (e) => handleChange(e) }
                    rows={ TEXT_AREA_ROWS }
                    cols={ TEXT_AREA_COLS }
                  >
                  </textarea>

                  { /* If the error.message field is defined, render that underneath the proof field. */ }
                  { form.error.message  && <p>{ form.error.message }</p> }
                </div>
              }

              { /* Form submission button: submits the form. NOTE: button is disabled if the submitting field of form is true. */ }
              <div className="levelboard-submit-btn-wrapper">
                <button type="submit" disabled={ form.submitting }>Submit</button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
};

/* ===== EXPORTS ===== */
export default InsertPopup;