/* ===== IMPORTS ===== */
import "./Levelboard.css";
import { GameContext, UserContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import InsertPopupLogic from "./InsertPopup.js";
import RecordInput from "./RecordInput";
import Username from "../../components/Username/Username.jsx";
import UserRow from "../../components/UserRow/UserRow";
import UserSearch from "../../components/UserSearch/UserSearch.jsx";

function InsertPopup({ popup, closePopup, level }) {
  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

	// user state & is moderator function from user context
  const { user, isModerator } = useContext(UserContext);

  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { form, fillForm, handleChange, onUserRowClick, handleSubmit, resetAndClosePopup } = InsertPopupLogic(level); 
  
  // helper functions
  const { capitalize, dateB2F } = FrontendHelper();

  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const type = path[4];
  const TEXT_AREA_ROWS = 5;
  const TEXT_AREA_COLS = 20;
  const USERS_PER_PAGE = 3;
  const userRowOptions = {
    isDetailed: false,
    disableLink: true,
    onUserRowClick: onUserRowClick
  };

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, and when the popup state is changed
  useEffect(() => {
    if (popup) {
      fillForm(level);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup]);

  /* ===== FORM POPUP COMPONENT ===== */ 
  return popup && form.values &&
    <div className="levelboard-popup">
      <div className="levelboard-popup-inner">
        
        { /* Close popup button */ }
        <div className="levelboard-popup-close-btn">
          <button type="button" onClick={ () => resetAndClosePopup(closePopup) } disabled={ form.submitting }>Close</button>
        </div>

        <div className="levelboard-insert-body">
          { isModerator(abb) &&
            <div className="levelboard-profile-select">
              <h2>Select a User</h2>
              <UserRow user={ user.profile } disableLink={ true } onClick={ onUserRowClick } />
              <h3>OR</h3>
              <UserSearch usersPerPage={ USERS_PER_PAGE } userRowOptions={ userRowOptions } />
            </div>
          }

          { /* Levelboard submit - contains the form header and form for submitting submissions to the database */ }
          <div className="levelboard-submit-wrapper">
            <div className="levelboard-submit">

              { /* Form header - specifies the type of submission */ }
              <h2>Submit a New { capitalize(type) }</h2>

              { /* Submission form - allows users to submit a record to the database */ }
              <form onSubmit={ (e) => handleSubmit(e, level.timer_type, closePopup) }>

                { /* If the current user is a moderator, render the user who the moderator is submitting on behalf of. */ }
                { isModerator(abb) &&
                  <div className="levelboard-input-group">
                    User:&nbsp;
                    <Username profile={ form.values.profile } />
                  </div>
                }

                { /* Record input: allows the user to input the record they achieved */ }
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

                { /* Submission tas checkbox: allows the user to specify whether or not the submission used tools. */ }
                <div className="levelboard-input-group">
                  <label htmlFor="tas">TAS: </label>
                  <input
                    id="tas"
                    type="checkbox"
                    checked={ form.values.tas }
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
                    disabled={ user.profile.id !== form.values.profile.id }
                    rows={ TEXT_AREA_ROWS }
                    cols={ TEXT_AREA_COLS }
                  >
                  </textarea>

                  { /* If the error.comment field is defined, render that underneath the proof field. */ }
                  { form.error.proof && <p>{ form.error.comment }</p> }

                </div>

                { /* Form submission button: submits the form. NOTE: button is disabled if the submitting field of form is true. */ }
                <div className="levelboard-submit-btn-wrapper">
                  <button type="submit" disabled={ form.submitting }>Submit</button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
};

/* ===== EXPORTS ===== */
export default InsertPopup;