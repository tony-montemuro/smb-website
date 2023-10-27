/* ===== IMPORTS ===== */
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { GameContext, PopupContext } from "../../../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import styles from "./Update.module.css";
import CachedPageControls from "../../../../components/CachedPageControls/CachedPageControls.jsx";
import Checkbox from "@mui/material/Checkbox";
import DetailedRecord from "../../../../components/DetailedRecord/DetailedRecord";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import FrontendHelper from "../../../../helper/FrontendHelper";
import TextField from "@mui/material/TextField";
import UpdateLogic from "./Update.js";

function Update({ level, updateBoard, submitting, setSubmitting }) {
  /* ===== STATES & FUNCTIONS ===== */
  const [pageNum, setPageNum] = useState(1);

  // states and functions from the js file
  const { form, handleChange, handleSubmittedAtChange, handleSubmissionChange, handleSubmit } = UpdateLogic(level, setSubmitting);

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
  const updateFieldText = "This field has been updated.";
  const COMMENT_ROWS = 2;
  const SUBMISSIONS_PER_TABLE = 5;

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    handleSubmissionChange(submissions[0]); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 
  
  /* ===== UPDATE COMPONENT ===== */
  return form.values &&
    <>
      <div className={ styles.header }>
        <h1>Update Submission</h1>
        <h2>Select Submission:</h2>
      </div>

      { /* Update submission table - allow user to select any submission to update */ }
      <div className="table">
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
                  className={ submission.id === form.values.id ? styles.selected : styles.row }
                  key={ submission.id } 
                  onClick={ () => handleSubmissionChange(submission) }
                >
                  <td>{ dateB2F(submission.submitted_at) }</td>
                  <td>{ <DetailedRecord submission={ submission } iconSize="small" timerType={ level.timer_type } /> }</td>
                  <td>{ submission.tas && "TAS" }</td>
                </tr>
              );
            })}
          </tbody>

        </table>

        { /* Render pagination controls at the bottom of this container */ }
        <CachedPageControls
          items={ submissions }
          itemsPerPage={ SUBMISSIONS_PER_TABLE }
          pageNum={ pageNum }
          setPageNum={ setPageNum }
          itemsName="Submissions"
        />
        
      </div>

      <hr />

      { /* Update submission form */ }
      <form onSubmit={ (e) => handleSubmit(e, submissions, updateBoard) }>
        <div className={ styles.formWrapper }>
          { form.values.approved &&
            <p><b>Note:</b> Since this submission has been approved by a moderator, any updates will revoke it's approval.</p>
          }

          <TextField 
            fullWidth
            helperText="This field cannot be updated."
            id="record"
            inputProps={ { readOnly: true } }
            label={ capitalize(type) }
            value={ form.values.record }
            variant="filled"
          />
          <DatePicker 
            disableFuture
            label="Date"
            format="YYYY-MM-DD"
            minDate={ dayjs(game.release_date) }
            value={ form.values.submitted_at ? dayjs(form.values.submitted_at) : form.values.submitted_at }
            onChange={ handleSubmittedAtChange }
            slotProps={{
              textField: { 
                color: form.values.submitted_at !== dateB2F(form.submission.submitted_at) ? "success" : "primary",
                fullWidth: true,
                helperText: form.values.submitted_at !== dateB2F(form.submission.submitted_at) ? updateFieldText : null,
                required: true,
                variant: "filled"
              }
            }}
          />
          <TextField
            color={ parseInt(form.values.monkey_id) !== form.submission.monkey.id ? "success" : "primary" }
            fullWidth
            helperText={ parseInt(form.values.monkey_id) !== form.submission.monkey.id ? updateFieldText : null }
            id="monkey_id"
            label="Monkey"
            select
            SelectProps={{ native: true }}
            onChange={ handleChange }
            value={ form.values.monkey_id }
            variant="filled"
          >
            { game.monkey.map(monkey => (
              <option value={ monkey.id } key={ monkey.id } >{ monkey.monkey_name }</option>
            ))}
          </TextField>
          <TextField
            color={ parseInt(form.values.platform_id) !== form.submission.platform.id ? "success" : "primary" }
            fullWidth
            helperText={ parseInt(form.values.platform_id) !== form.submission.platform.id ? updateFieldText : null }
            id="platform_id"
            label="Platform"
            select
            SelectProps={{ native: true }}
            onChange={ handleChange }
            value={ form.values.platform_id }
            variant="filled"
          >
            { game.platform.map(platform => (
              <option value={ platform.id } key={ platform.id } >{ platform.platform_name }</option>
            ))}
          </TextField>
          <TextField
            color={ parseInt(form.values.region_id) !== form.submission.region.id ? "success" : "primary" }
            fullWidth
            helperText={ parseInt(form.values.region_id) !== form.submission.region.id ? updateFieldText : null }
            id="region_id"
            label="Region"
            select
            SelectProps={{ native: true }}
            onChange={ handleChange }
            value={ form.values.region_id }
            variant="filled"
          >
            { game.region.map(region => (
              <option value={ region.id } key={ region.id } >{ region.region_name }</option>
            ))}
          </TextField>
          <TextField 
            color={ form.values.proof !== form.submission.proof ? "success" : "primary" }
            fullWidth
            helperText={ form.values.proof !== form.submission.proof ? updateFieldText : null }
            id="proof"
            label="Proof"
            placeholder="Must be a YouTube, Twitch, or X (Twitter) URL"
            onChange={ handleChange }
            value={ form.values.proof }
            variant="filled"
          />
          <FormGroup>
              <FormControlLabel 
                control={ 
                  <Checkbox 
                    checked={ form.values.live } 
                    id="live" 
                    onChange={ handleChange } 
                    inputProps={{ "aria-label": "controlled" }} 
                  />
                } 
                label="Live Proof" 
              />
              { form.values.live !== form.submission.live && <FormHelperText>{ updateFieldText }</FormHelperText> }
            </FormGroup>
            <FormGroup>
              <FormControlLabel 
                control={ 
                  <Checkbox 
                    checked={ form.values.tas } 
                    id="tas" 
                    onChange={ handleChange } 
                    inputProps={{ "aria-label": "controlled" }} 
                  />
                } 
                label="TAS" 
              />
              { form.values.tas !== form.submission.tas  && <FormHelperText>{ updateFieldText }</FormHelperText> }
            </FormGroup>
            <TextField
              color={ form.values.comment !== form.submission.comment ? "success" : "primary" }
              fullWidth
              helperText={ form.values.comment !== form.submission.comment ? updateFieldText : null }
              id="comment"
              label="Comment"
              multiline
              rows={ COMMENT_ROWS }
              onChange={ handleChange }
              value={ form.values.comment }
              variant="filled"
            />

          { /* Form submission button: submits the form. NOTE: button is disabled if the submitting field of form is true. */ }
          <div className={ styles.submitBtns }>
            <button 
              className="cancel" 
              type="button" 
              onClick={ () => handleSubmissionChange(form.submission) }
              disabled={ submitting }

            >
              Reset
            </button>
            <button type="submit" disabled={ submitting }>Update</button>
          </div>
        </div>

      </form>
  
    </>
};

/* ===== EXPORTS ===== */
export default Update;