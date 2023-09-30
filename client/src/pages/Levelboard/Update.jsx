/* ===== IMPORTS ===== */
import { GameContext, PopupContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CachedPageControls from "../../components/CachedPageControls/CachedPageControls.jsx";
import DetailedRecord from "../../components/DetailedRecord/DetailedRecord";
import FrontendHelper from "../../helper/FrontendHelper";
import UpdateLogic from "./Update.js";

function Update({ level, updateBoard }) {
  /* ===== STATES & FUNCTIONS ===== */
  const [pageNum, setPageNum] = useState(1);

  // states and functions from the js file
  const { form, fillForm, handleChange, handleSubmissionChange, handleSubmit } = UpdateLogic(level);

  // helper functions
  const { capitalize, dateB2F } = FrontendHelper();

  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  // popup data state from popup context
  const { popupData } = useContext(PopupContext);

  /* ===== VARIABLES ===== */
  const submissions = popupData;
  const location = useLocation();
  const type = location.pathname.split("/")[4];
  const TEXT_AREA_ROWS = 5;
  const SUBMISSIONS_PER_TABLE = 5;

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    fillForm(submissions); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 
  
  /* ===== UPDATE COMPONENT ===== */
  return form.values &&
    <div className="levelboard-update">

      { /* Update header */ }
      <div className="levelboard-update-header">
        <h2>Update Submission</h2>
      </div>

      { /* Update submission form */ }
      <form onSubmit={ (e) => handleSubmit(e, submissions, updateBoard) }>

        { /* Submission selector: render a table that allows the user to select any of their submissions. */ }
        <div className="levelboard-table-group">
          <p>Select Submission:</p>

          <div className="levelboard-table-group-body">
            <table>

              { /* Table header - render the description of what is rendered in each column */ }
              <thead>
                <tr>
                  <th>Date</th>
                  <th>{ capitalize(type) }</th>
                  <th></th>
                </tr>
              </thead>

              { /* Table body - render a unique, selectable row for each submission */ }
              <tbody>
                { submissions.slice((pageNum-1)*SUBMISSIONS_PER_TABLE, pageNum*SUBMISSIONS_PER_TABLE).map(submission => {
                  return (
                    <tr 
                      className={ submission.id === form.values.id ? "levelboard-table-row-selected" : "" }
                      key={ submission.id } 
                      onClick={ () => handleSubmissionChange(submission.id, submissions) }
                    >
                      <td>{ dateB2F(submission.submitted_at) }</td>
                      <td>{ <DetailedRecord submission={ submission } iconSize={ "small" } timerType={ level.timer_type } /> }</td>
                      <td>{ submission.tas && "TAS" }</td>
                    </tr>
                  );
                })}
              </tbody>

            </table>

            { /* Render pagination controls at the bottom of this container */ }
            <div className="levelboard-table-group-page-controls-wrapper">
              <CachedPageControls
                items={ submissions }
                itemsPerPage={ SUBMISSIONS_PER_TABLE }
                pageNum={ pageNum }
                setPageNum={ setPageNum }
                itemsName={ "Submissions" }
              />
            </div>
            
          </div>
        </div>

        <hr />

        { form.values.approved &&
          <p><b>Note:</b> Since this submission has been approved by a moderator, any updates will revoke it's approval.</p>
        }

        { /* Submission record: simply display the record, which is not able to be changed in this input. */ }
        <div className="levelboard-input-group">
          <span>{ capitalize(type) }: { form.values.record }</span>
        </div>

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

        { /* Submission monkey input: allows the user to select the monkey they achieved their submission with from a dropdown. */ }
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

        { /* Submission live checkbox: allows the user to specify whether or not the submission proof was live or not. */ }
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

        { /* Submission comment input: allows the user to modify their submission comment. */ }
        <div className="levelboard-textarea-group">
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

        { /* Form submission button: submits the form. NOTE: button is disabled if the submitting field of form is true. */ }
        <div className="levelboard-submit-btn-wrapper">
          <button type="submit" disabled={ form.submitting }>Update</button>
        </div>

      </form>
  
    </div>
};

/* ===== EXPORTS ===== */
export default Update;