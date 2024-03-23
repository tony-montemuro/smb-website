/* ===== IMPORTS ===== */
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Link } from "react-router-dom";
import { renderPosition, PositionDisclaimer } from "../../Positions/Positions.jsx";
import { PopupContext } from "../../../utils/Contexts";
import { useContext, useEffect } from "react";
import dayjs from "dayjs";
import styles from "./Submission.module.css";
import AddIcon from "@mui/icons-material/Add";
import Checkbox from "@mui/material/Checkbox";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import EmbededVideo from "../../../components/EmbededVideo/EmbededVideo.jsx";
import FancyLevel from "../../FancyLevel/FancyLevel.jsx";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import FrontendHelper from "../../../helper/FrontendHelper";
import IconButton from "@mui/material/IconButton";
import Rejection from "./Rejection.jsx";
import SubmissionLogic from "./Submission.js";
import TextField from "@mui/material/TextField";
import Username from "../../../components/Username/Username";

function Submission({ game, isUnapproved, setSubmissions, submitting, setSubmitting }) {
  /* ===== CONTEXTS ===== */

  // popup data state from popup context
  const { popupData } = useContext(PopupContext);

  /* ===== VARIABLES ===== */
  const submission = popupData;
  const category = submission.level.category;
  const type = submission.score ? "score" : "time";
  const creator = submission.report && submission.report.creator;
  const COMMENT_MAX_LENGTH = 100;
  const COMMENT_ROWS = 2;
  const updateFieldText = "This field has been updated.";
  const immutableText = "This field cannot be updated.";

  /* ===== FUNCTIONS ===== */

  // states & functions from the js file
  const { 
    form, 
    showReject, 
    setShowReject,
    fillForm, 
    handleChange, 
    handleSubmittedAtChange,
    handleToggle, 
    clearMessage,
    isFormUnchanged,
    onApproveClick,
    onRejectClick
  } = SubmissionLogic(submission, game, isUnapproved, setSubmissions, setSubmitting);

  // helper functions
  const { recordB2F, dateB2F } = FrontendHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    fillForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== SUBMISSION COMPONENT ===== */ 
  return form.values &&
    <div className={ styles.submission }>

      { /* Header - render the basic submission information, and any report data, if the submission was reporeted */ }
      <div className={ styles.header }>
        <h1>
          <Link to={ `/games/${ game.abb }/${ category }/${ type }/${ submission.level.name }` }>
            <FancyLevel level={ submission.level.name } />
          </Link>
        </h1>
        <h2>
          { recordB2F(submission.record, type, submission.level.timer_type) } by <Username profile={ submission.profile } /> 
        </h2>

        { /* If submission is reported, render the reasoning left by the creator of the report. */ }
        { !isUnapproved &&
          <>
            <h3>
              <strong>The following submission was reported by&nbsp;</strong>
              <Username profile={ creator } />.
            </h3>
            <p>They left the following message with the report: "{ submission.report.message }"</p>
          </>
        }

      </div>

      <hr />

      { /* Render position disclaimer component, which details the complicated position fields */ }
      <PositionDisclaimer />

      { /* Body - render the submission, as well as a form to update certain fields */ }
      <div className={ styles.body }>

        { /* Left side - contains the embeded video player */ }
        <div className={ styles.left }>
          <EmbededVideo url={ submission.proof } />
          { !submission.proof && <h3><em>Please keep this in mind as you make your decision!</em></h3> }
        </div>

        { /* Right side - contains the submission form */ }
        <div className={ styles.right }>
          <form>
            <div className={ styles.formWrapper }>

              { /* The various fields of the form, which describe the submission */ }
              <TextField 
                fullWidth
                helperText={ immutableText }
                id="all_position"
                inputProps={ { readOnly: true } }
                label="Position"
                value={ renderPosition(submission.id, submission.submitted_at) ? submission.all_position : "-" }
                variant="filled"
              />
              { submission.position && 
                <TextField 
                  fullWidth
                  helperText={ immutableText }
                  id="position"
                  inputProps={ { readOnly: true } }
                  label="Live Position"
                  value={ renderPosition(submission.id, submission.submitted_at) ? submission.position : "-" }
                  variant="filled"
                />
              }
              <DatePicker 
                color={ form.error.submitted_at ? "error" : (form.values.submitted_at !== dateB2F(submission.submitted_at) ? "success" : "primary") }
                disableFuture
                label="Date"
                format="YYYY-MM-DD"
                minDate={ dayjs(game.min_date) }
                value={ form.values.submitted_at ? dayjs(form.values.submitted_at) : form.values.submitted_at }
                onChange={ handleSubmittedAtChange }
                slotProps={{
                  textField: { 
                    fullWidth: true,
                    helperText: form.error.submitted_at ? form.error.submitted_at : (form.values.submitted_at !== dateB2F(submission.submitted_at) ? updateFieldText : null),
                    variant: "filled"
                  }
                }}
              />
              <TextField
                color={ parseInt(form.values.monkey_id) !== submission.monkey.id ? "success" : "primary" }
                fullWidth
                helperText={ parseInt(form.values.monkey_id) !== submission.monkey.id ? updateFieldText : null }
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
                color={ parseInt(form.values.platform_id) !== submission.platform.id ? "success" : "primary" }
                fullWidth
                helperText={ parseInt(form.values.platform_id) !== submission.platform.id ? updateFieldText : null }
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
                color={ parseInt(form.values.region_id) !== submission.region.id ? "success" : "primary" }
                fullWidth
                helperText={ parseInt(form.values.region_id) !== submission.region.id ? updateFieldText : null }
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
                color={ form.error.proof ? "error" : (form.values.proof !== submission.proof ? "success" : "primary") }
                fullWidth
                helperText={ form.error.proof ? form.error.proof : (form.values.proof !== submission.proof ? updateFieldText : null) }
                id="proof"
                label="Proof"
                placeholder="Must be a valid URL type"
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
                { form.error.live ?
                  <FormHelperText error>{ form.error.live }</FormHelperText>
                :
                  submission.live !== form.values.live && <FormHelperText>{ updateFieldText }</FormHelperText>
                }
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
                { submission.tas !== form.values.tas && <FormHelperText>{ updateFieldText }</FormHelperText> }
              </FormGroup>
              <TextField
                color={ form.values.comment !== submission.comment ? "success" : "primary" }
                fullWidth
                helperText={ form.values.comment !== submission.comment ? updateFieldText : null }
                id="comment"
                inputProps={ { maxLength: COMMENT_MAX_LENGTH, readOnly: true } }
                InputProps={ { 
                  endAdornment: submission.comment ? (
                    <IconButton size="small" onClick={ handleToggle }>
                      { form.values.comment ? <ClearRoundedIcon /> : <AddIcon /> }
                    </IconButton>
                  ) : undefined
                } }
                label="Comment"
                multiline
                rows={ COMMENT_ROWS }
                onChange={ handleChange }
                value={ form.values.comment }
                variant="filled"
              />
              <TextField
                color={ form.values.mod_note !== submission.mod_note ? "success" : "primary" }
                fullWidth
                helperText={ form.values.mod_note !== submission.mod_note ? updateFieldText : null }
                id="mod_note"
                inputProps={ { maxLength: COMMENT_MAX_LENGTH } }
                label="Moderator Note"
                multiline
                rows={ COMMENT_ROWS }
                onChange={ handleChange }
                value={ form.values.mod_note }
                variant="filled"
              />

              { /* Button used to reset the form back to it's original values */ }
              <button className="cancel" type="button" onClick={ () => fillForm() } disabled={ submitting || isFormUnchanged() }>Reset Values</button>

              { /* Two buttons: one for approving the submission, and one for deleting. */ }
              <div className={ styles.btns }>
                <button type="submit" disabled={ showReject || submitting } onClick={ (e) => onApproveClick(e) }>Approve</button>
                <button type="button" disabled={ showReject || submitting } onClick={ () => setShowReject(true) }>Reject</button>
              </div>

            </div>
          </form>
        </div>

      </div>

      { /* If show reject is set to true, render rejection prompt. */ }
      { showReject && 
        <Rejection 
          form={ form } 
          clearMessage={ clearMessage }
          handleChange={ handleChange }
          setShowReject={ setShowReject } 
          onReject={ onRejectClick } 
        /> 
      }

    </div>;
};

/* ===== EXPORTS ===== */
export default Submission;