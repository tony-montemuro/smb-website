/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import { StaticCacheContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import EmbededVideo from "../../components/EmbededVideo/EmbededVideo.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import SubmissionPopupLogic from "./SubmissionPopup.js";
import UpdatedFieldSymbol from "./UpdatedFieldSymbol";
import Username from "../../components/Username/Username";

function SubmissionPopup({ popup, setPopup, dispatchRecent }) {
  /* ===== CONTEXTS ===== */

  // static cache from static cache object
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== VARIABLES ===== */
  const submission = popup;
  const games = staticCache.games;
  const game = submission && games.find(row => row.abb === submission.level.mode.game.abb);
  const category = submission && (submission.level.misc ? "misc" : "main");
  const type = submission && submission.score ? "score" : "time";
  const TEXT_AREA_ROWS = 5;

  /* ===== FUNCTIONS ===== */

  // states & functions from the js file
  const { form, showMessage, setShowMessage, fillForm, handleChange, handleClose, handleSubmit } = SubmissionPopupLogic();

  // helper functions
  const { capitalize, cleanLevelName, recordB2F, dateB2F } = FrontendHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the popup parameter is updated
  useEffect(() => {
    if (submission) {
      fillForm(submission);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

  /* ===== SUBMISSION POPUP COMPONENT ===== */ 
  return popup && form.values ?
    <div className="approvals-popup">
      <div className="approvals-popup-inner">

        { /* Close button - a button that allows user to close the popup */ }
        <div className="approvals-popup-close-btn">
          <button type="button" onClick={ () => handleClose(setPopup) }>Close</button>
        </div>

        { /* Approvals popup body: the main content of the popup */ }
        <div className="approvals-popup-body">

          { /* Approvals body left side */ }
          <div className="approvals-popup-left">
            <EmbededVideo url={ submission.details.proof } />
          </div>

          { /* Approvals body right side */ }
          <div className="approvals-popup-right">
            
            { /* Submission popup form - allows moderator to make edits to the submission, if necessary */ }
            <form>
              <div className="approvals-popup-form">

                { /* User: Render the username of the user who submitted the submission (not-editable) */ }
                <div className="approvals-popup-input">
                  User:&nbsp;
                  <Username country={ submission.profile.country } profileId={ submission.profile.id } username={ submission.profile.username } /> 
                </div>

                { /* Level: Render the name of the level as a link tag (not-editable) */ }
                <div className="approvals-popup-input">Level:&nbsp;
                  <Link to={ `/games/${ game.abb }/${ category }/${ type }/${ submission.level.name }` }>
                    { cleanLevelName(submission.level.name) }
                  </Link> 
                </div>

                { /* Record: render the user's record (not-editable) */ }
                <div className="approvals-popup-input">{ capitalize(type) }: { recordB2F(submission.details.record, type) }</div>

                { /* Position: render the user's position (not-editable) */ }
                <div className="approvals-popup-input">Position: { submission.details.all_position }</div>

                { /* Live Position: render the user's position calculated using only LIVE submissions (not-editable) */ }
                <div className="approvals-popup-input">Live Position: { submission.details.position }</div>

                { /* Date: render the date of the submission in the form of a date picker */ }
                <div className="approvals-popup-input">
                  <label htmlFor="submitted_at">Date: </label>
                  <input 
                    id="submitted_at" 
                    type="date" 
                    min={ game.release_date } 
                    max={ dateB2F() }
                    value={ form.values.submitted_at }
                    onChange={ (e) => handleChange(e) }
                  />

                  { /* Render an updated field symbol if the submitted at value has been modified */ }
                  <UpdatedFieldSymbol oldVal={ dateB2F(submission.details.submitted_at) } newVal={ form.values.submitted_at } />
                </div>

                { /* Region: Render a dropdown allowing the user to select a region if necessary */ }
                <div className="approvals-popup-input">
                  <label htmlFor="region_id">Region: </label>
                  <select id="region_id" value={ form.values.region_id } onChange={ (e) => handleChange(e) }>
                    { game.region.map(region => (
                      <option key={ region.id } value={ region.id }>{ region.region_name }</option>
                    ))}
                  </select>

                  { /* Render an updated field symbol if the region_id value has been modified */ }
                  <UpdatedFieldSymbol oldVal={ submission.details.region.id } newVal={ parseInt(form.values.region_id) } />
                </div>

                { /* Monkey: Render a dropdown allowing the user to select a monkey if necessary */ }
                <div className="approvals-popup-input">
                  <label htmlFor="monkey_id">Monkey: </label>
                    <select id="monkey_id" value={ form.values.monkey_id } onChange={ (e) => handleChange(e) }>
                      { game.monkey.map((monkey) => (
                        <option key={ monkey.id } value={ monkey.id }>{ monkey.monkey_name }</option>
                      ))}
                    </select>

                    { /* Render an updated field symbol if the monkey_id value has been modified */ }
                    <UpdatedFieldSymbol oldVal={ submission.details.monkey.id } newVal={ parseInt(form.values.monkey_id) } />
                </div>

                { /* Proof: Render a textbox allowing the user to edit the proof if necessary */ }
                <div className="approvals-popup-input">
                  <label htmlFor="proof">Proof: </label>
                  <input 
                    id="proof"
                    type="url"
                    value={ form.values.proof }
                    onChange={ (e) => handleChange(e) }
                  />

                  { /* Render an updated field symbol if the proof value has been modified */ }
                  <UpdatedFieldSymbol oldVal={ submission.details.proof } newVal={ form.values.proof } />
                </div>

                { /* Live Proof: Render a checkbox allowing the user to specify if the proof is live or not, if necessary */ }
                <div className="approvals-popup-input">
                  <label htmlFor="live">Live Proof: </label>
                  <input
                    id="live"
                    type="checkbox"
                    checked={ form.values.live }
                    onChange={ (e) => handleChange(e) }
                  />

                  { /* Render an updated field symbol if the live value has been modified */ }
                  <UpdatedFieldSymbol oldVal={ submission.details.live } newVal={ form.values.live } />
                </div>

                { /* Comment: Render a textbox allowing the user to change the comment, if necessary */ }
                <div className="approvals-popup-input approvals-popup-textarea">
                  <label htmlFor="comment">Comment (optional): </label>
                  <div id="approvals-comment-wrapper">
                    <textarea 
                      id="comment"
                      value={ form.values.comment }
                      onChange={ (e) => handleChange(e) }
                      rows={ TEXT_AREA_ROWS }
                    >
                    </textarea>

                    { /* Render an updated field symbol if the comment value has been modified */ }
                    <UpdatedFieldSymbol oldVal={ submission.details.comment } newVal={ form.values.comment } />
                  </div>
                </div>
              </div>

              { /* Button used to reset the form back to it's original values */ }
              <div className="approvals-popup-buttons">
                <button type="button" onClick={ () => fillForm(submission) }>Reset Values</button>
              </div>

              { /* Two buttons: one for approving the submission, and one for deleting. */ }
              <div className="approvals-popup-buttons">
                <button type="submit" disabled={ showMessage } onClick={ (e) => handleSubmit(e, "approve", submission, dispatchRecent, setPopup) }>Approve Submission</button>
                <button type="button" disabled={ showMessage } onClick={ () => setShowMessage(true) }>Reject Submission</button>
              </div>

              { /* Render the message input if the showMessage state is set to true. */ }
              { showMessage &&
                <>
                  <div className="approvals-popup-form">

                    { /* Render information about rejections */ }
                    <div className="approvals-popup-notice">
                      <h3>Are you sure you want to reject this submission?</h3>
                    </div>
                    <div className="approvals-popup-notice">
                      <span><b>Note: </b>Rejecting a submission also deletes it!</span>
                    </div>

                    { /* Message: Render a textbox allowing the user to change the comment, if necessary */ }
                    <div className="approvals-popup-input approvals-popup-textarea">
                      <label htmlFor="message">Message (optional): </label>
                      <textarea 
                        id="message"
                        value={ form.values.message }
                        onChange={ (e) => handleChange(e) }
                        rows={ TEXT_AREA_ROWS }
                      >
                      </textarea>
                    </div>

                    { /* Two buttons: one for yes, and one for no. */ }
                    <div className="approvals-popup-buttons">
                      <button type="submit" onClick={ (e) => handleSubmit(e, "delete", submission, dispatchRecent, setPopup) }>
                        Yes, Reject
                      </button>
                      <button type="button" onClick={ () => setShowMessage(false) }>No, Cancel</button>
                    </div>
                  </div>
                </>
                
              }

            </form>
          
          </div>
        </div>

      </div>
    </div>
  :
    null
};

/* ===== EXPORTS ===== */
export default SubmissionPopup;