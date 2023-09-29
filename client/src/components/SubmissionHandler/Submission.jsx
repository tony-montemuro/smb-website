/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import { UserContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import EmbedHelper from "../../helper/EmbedHelper";
import EmbededVideo from "../../components/EmbededVideo/EmbededVideo.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import SubmissionLogic from "./Submission.js";
import UpdatedFieldSymbol from "./UpdatedFieldSymbol";
import Username from "../../components/Username/Username";

function Submission({ submission, game, isUnapproved, setSubmissions }) {
  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== VARIABLES ===== */
  const category = submission && submission.level.category;
  const type = submission && submission.score ? "score" : "time";
  const isOwn = submission && submission.profile.id === user.profile.id;
  const TEXT_AREA_ROWS = 5;
  const creator = submission && submission.report && submission.report.creator;

  /* ===== FUNCTIONS ===== */

  // states & functions from the js file
  const { 
    form, 
    showReject, 
    clearToggle, 
    setShowReject, 
    fillForm, 
    handleChange, 
    handleToggle, 
    onApproveClick,
    onRejectClick
  } = SubmissionLogic(submission, game, isUnapproved, setSubmissions);

  // helper functions
  const { capitalize, cleanLevelName, recordB2F, dateB2F } = FrontendHelper();
  const { getUrlType } = EmbedHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    fillForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== SUBMISSION COMPONENT ===== */ 
  return form.values ?
    <div className="submission-handler-submission">

      { /* If submission is reported, render the reasoning left by the creator of the report. */ }
      { !isUnapproved &&
        <div className="submission-handler-report">
          <h1>
            The following submission was reported by&nbsp;
            <Username profile={ creator } />.
          </h1>
          <p>They left the following message with the report: "{ submission.report.message }"</p>
        </div>
      }

      { /* Submission handler submission - left side */ }
      <div className="submission-handler-submission-left" style={ getUrlType(submission.proof) !== "twitter" ? { height: "50vh" } : null }>
        <EmbededVideo url={ submission.proof } />
      </div>

      { /* Submission handler submission - right side */ }
      <div className="submission-handler-submission-right">
        
        { /* Submission form - allows moderator to make edits to the submission, if necessary */ }
        <form>
          <div className="submission-handler-submission-form">

            { /* User: Render the username of the user who submitted the submission (not-editable) */ }
            <div className="submission-handler-submission-input">
              User:&nbsp;
              <Username profile={ submission.profile } /> 
            </div>

            { /* Level: Render the name of the level as a link tag (not-editable) */ }
            <div className="submission-handler-submission-input">Level:&nbsp;
              <Link to={ `/games/${ game.abb }/${ category }/${ type }/${ submission.level.name }` }>
                { cleanLevelName(submission.level.name) }
              </Link> 
            </div>

            { /* Record: render the user's record (not-editable) */ }
            <div className="submission-handler-submission-input">{ capitalize(type) }: { recordB2F(submission.record, type, submission.level.timer_type) }</div>

            { /* Position: render the user's position (not-editable) */ }
            <div className="submission-handler-submission-input">Position: { submission.all_position }</div>

            { /* Live Position: render the user's position calculated using only LIVE submissions (if it exists; not-editable) */ }
            { submission.position &&
              <div className="submission-handler-submission-input">Live Position: { submission.position }</div>
            }

            { /* Date: render the date of the submission in the form of a date picker */ }
            <div className="submission-handler-submission-input">

              { /* Render an updated field symbol if the submitted at value has been modified */ }
              <UpdatedFieldSymbol oldVal={ dateB2F(submission.submitted_at) } newVal={ form.values.submitted_at } />

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

            { /* Monkey: Render a dropdown allowing the user to select a monkey if necessary */ }
            <div className="submission-handler-submission-input">
              <label htmlFor="monkey_id">Monkey: </label>
                <select id="monkey_id" value={ form.values.monkey_id } onChange={ (e) => handleChange(e) }>
                  { game.monkey.map(monkey => (
                    <option key={ monkey.id } value={ monkey.id }>{ monkey.monkey_name }</option>
                  ))}
                </select>

                { /* Render an updated field symbol if the monkey_id value has been modified */ }
                <UpdatedFieldSymbol oldVal={ submission.monkey.id } newVal={ parseInt(form.values.monkey_id) } />
            </div>

            { /* Platform: Render a dropdown allowing the user to select a platform if necessary */ }
            <div className="submission-handler-submission-input">
              <label htmlFor="platform_id">Platform: </label>
                <select id="platform_id" value={ form.values.platform_id } onChange={ (e) => handleChange(e) }>
                  { game.platform.map(platform => (
                    <option key={ platform.id } value={ platform.id }>{ platform.platform_name }</option>
                  ))}
                </select>

                { /* Render an updated field symbol if the platform_id value has been modified */ }
                <UpdatedFieldSymbol oldVal={ submission.platform.id } newVal={ parseInt(form.values.platform_id) } />
            </div>

            { /* Region: Render a dropdown allowing the user to select a region if necessary */ }
            <div className="submission-handler-submission-input">
              <label htmlFor="region_id">Region: </label>
              <select id="region_id" value={ form.values.region_id } onChange={ (e) => handleChange(e) }>
                { game.region.map(region => (
                  <option key={ region.id } value={ region.id }>{ region.region_name }</option>
                ))}
              </select>

              { /* Render an updated field symbol if the region_id value has been modified */ }
              <UpdatedFieldSymbol oldVal={ submission.region.id } newVal={ parseInt(form.values.region_id) } />
            </div>

            { /* Proof: Render a textbox allowing the user to edit the proof if necessary */ }
            <div className="submission-handler-submission-input">
              <label htmlFor="proof">Proof: </label>
              <input 
                id="proof"
                type="url"
                value={ form.values.proof }
                onChange={ (e) => handleChange(e) }
              />

              { /* Render an updated field symbol if the proof value has been modified */ }
              <UpdatedFieldSymbol oldVal={ submission.proof } newVal={ form.values.proof } />
            </div>

            { /* Live Proof: Render a checkbox allowing the user to specify if the proof is live or not, if necessary */ }
            <div className="submission-handler-submission-input">
              <label htmlFor="live">Live Proof: </label>
              <input
                id="live"
                type="checkbox"
                checked={ form.values.live }
                onChange={ (e) => handleChange(e) }
              />

              { /* Render an updated field symbol if the live value has been modified */ }
              <UpdatedFieldSymbol oldVal={ submission.live } newVal={ form.values.live } />
            </div>

            { /* TAS: Render a checkbox allowing the user to specify if the submission used tools */ }
            <div className="submission-handler-submission-input">
              <label htmlFor="tas">TAS: </label>
              <input
                id="tas"
                type="checkbox"
                checked={ form.values.tas }
                onChange={ (e) => handleChange(e) }
              />

              { /* Render an updated field symbol if the live value has been modified */ }
              <UpdatedFieldSymbol oldVal={ submission.live } newVal={ form.values.live } />
            </div>

            { /* Comment: Render a read-only textbox that allows the user to see the comment */ }
            <div className="submission-handler-submission-input submission-handler-submission-textarea">
              <label htmlFor="comment">Comment (optional): </label>
              <div id="submission-handler-comment-wrapper">
                <textarea 
                  id="comment"
                  value={ !clearToggle ? form.values.comment : "" }
                  onChange={ (e) => handleChange(e) }
                  rows={ TEXT_AREA_ROWS }
                  readOnly={ true }
                >
                </textarea>

                { /* Render an updated field symbol if the comment value has been modified */ }
                <UpdatedFieldSymbol oldVal={ submission.comment } newVal={ form.values.comment } />
              </div>
            </div>

            { /* Comment toggle: a button that allows the moderator to clear the comment, if necessary */ }
            <div className="submission-handler-submission-input">
              <label htmlFor="comment-toggle">Clear Comment: </label>
              <input 
                type="checkbox"
                checked={ clearToggle }
                onChange={ handleToggle }
              />
            </div>
          </div>

          { /* Button used to reset the form back to it's original values */ }
          <div className="submission-handler-btns">
            <button type="button" onClick={ () => fillForm() }>Reset Values</button>
          </div>

          { /* Two buttons: one for approving the submission, and one for deleting. */ }
          <div className="submission-handler-btns">
            <button type="submit" disabled={ showReject } onClick={ (e) => onApproveClick(e) }>Approve Submission</button>
            <button type="button" disabled={ showReject } onClick={ () => setShowReject(true) }>Reject Submission</button>
          </div>

          { /* Render the message input if the showReject state is set to true. */ }
          { showReject &&
            <>
              <div className="submission-handler-submission-form">

                { /* Render information about rejections */ }
                <div className="submission-handler-notice">
                  <h3>
                    { isOwn ?
                      `Are you sure you want to reject your own submission?`
                    :
                      `Are you sure you want to reject this submission?`
                    }
                  </h3>
                </div>
                <div className="submission-handler-notice">
                  <span><b>Note: </b>Rejecting a submission also deletes it!</span>
                </div>

                { /* Message: Render a textbox allowing the user to add a message, if necessary. Note: this should only
                render for submissions not belonging to the current user */ }
                { !isOwn &&
                  <div className="submission-handler-submission-input submission-handler-submission-textarea">
                    <label htmlFor="message">Message (optional): </label>
                    <textarea 
                      id="message"
                      value={ form.values.message }
                      onChange={ (e) => handleChange(e) }
                      rows={ TEXT_AREA_ROWS }
                    >
                    </textarea>
                  </div>
                }

                { /* Two buttons: one for yes, and one for no. */ }
                <div className="submission-handler-btns">
                  <button type="button" onClick={ () => setShowReject(false) }>No, Cancel</button>
                  <button type="submit" onClick={ (e) => onRejectClick(e) }>
                    Yes, Reject
                  </button>
                </div>
              </div>
            </>
            
          }

        </form>
      
      </div>

    </div>
  :
    null
};

/* ===== EXPORTS ===== */
export default Submission;