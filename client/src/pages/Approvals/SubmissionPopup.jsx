/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import { StaticCacheContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import EmbededVideo from "../../components/EmbededVideo/EmbededVideo.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import SubmissionPopupLogic from "./SubmissionPopup.js";
import Username from "../../components/Username/Username";

function SubmissionPopup({ popup, setPopup }) {
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
  const { form, fillForm, handleChange, handleClose } = SubmissionPopupLogic();

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
            <div className="approvals-popup-form">
              <form>

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
                </div>

                { /* Region: Render a dropdown allowing the user to select a region if necessary */ }
                <div className="approvals-popup-input">
                  <label htmlFor="region_id">Region: </label>
                  <select id="region_id" value={ form.values.region_id } onChange={ (e) => handleChange(e) }>
                    { game.region.map(region => (
                      <option key={ region.id } value={ region.id }>{ region.region_name }</option>
                    ))}
                  </select>
                </div>

                { /* Monkey: Render a dropdown allowing the user to select a monkey if necessary */ }
                <div className="approvals-popup-input">
                  <label htmlFor="monkey_id">Monkey: </label>
                    <select id="monkey_id" value={ form.values.monkey_id } onChange={ (e) => handleChange(e) }>
                      { game.monkey.map((monkey) => (
                        <option key={ monkey.id } value={ monkey.id }>{ monkey.monkey_name }</option>
                      ))}
                    </select>
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
                </div>

                { /* Comment: Render a textbox allowing the user to change the comment, if necessary */ }
                <div className="approvals-popup-input approvals-popup-textarea">
                  <label htmlFor="comment">Comment (optional): </label>
                  <textarea 
                    id="comment"
                    value={ form.values.comment }
                    onChange={ (e) => handleChange(e) }
                    rows={ TEXT_AREA_ROWS }
                  >
                  </textarea>
                </div>

              </form>
            </div>
          
          </div>
        </div>

      </div>
    </div>
  :
    null
};

/* ===== EXPORTS ===== */
export default SubmissionPopup;