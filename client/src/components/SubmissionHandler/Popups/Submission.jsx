/* ===== IMPORTS ===== */
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Link } from "react-router-dom";
import { PopupContext } from "../../../utils/Contexts";
import { useContext, useEffect } from "react";
import dayjs from "dayjs";
import styles from "./Submission.module.css";
import AddIcon from "@mui/icons-material/Add";
import Checkbox from "@mui/material/Checkbox";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import EmbedHelper from "../../../helper/EmbedHelper";
import EmbededVideo from "../../../components/EmbededVideo/EmbededVideo.jsx";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import FrontendHelper from "../../../helper/FrontendHelper";
import IconButton from "@mui/material/IconButton";
import Rejection from "./Rejection.jsx";
import SubmissionLogic from "./Submission.js";
import TextField from "@mui/material/TextField";
import Username from "../../../components/Username/Username";

function Submission({ game, isUnapproved, setSubmissions }) {
  /* ===== CONTEXTS ===== */

  // popup data state from popup context
  const { popupData } = useContext(PopupContext);

  /* ===== VARIABLES ===== */
  const submission = popupData;
  const category = submission.level.category;
  const type = submission.score ? "score" : "time";
  const creator = submission.report && submission.report.creator;
  const TEXT_AREA_ROWS = 2;
  const updateFieldText = "This field has been updated.";

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
    onApproveClick,
    onRejectClick
  } = SubmissionLogic(submission, game, isUnapproved, setSubmissions);

  // helper functions
  const { cleanLevelName, recordB2F, dateB2F } = FrontendHelper();
  const { getUrlType } = EmbedHelper();

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
            { cleanLevelName(submission.level.name) }
          </Link>
          :&nbsp;
          { recordB2F(submission.record, type, submission.level.timer_type) } by <Username profile={ submission.profile } /> 
        </h1>

        { /* If submission is reported, render the reasoning left by the creator of the report. */ }
        { !isUnapproved &&
          <>
            <h2>
              The following submission was reported by&nbsp;
              <Username profile={ creator } />.
            </h2>
            <p>They left the following message with the report: "{ submission.report.message }"</p>
          </>
        }

      </div>

      { /* Body - render the submission, as well as a form to update certain fields */ }
      <div className={ styles.body }>

        { /* Left side - contains the embeded video player */ }
        <div className={ styles.left } style={ getUrlType(submission.proof) !== "twitter" ? { height: "60vh" } : null }>
          <EmbededVideo url={ submission.proof } />
        </div>

        { /* Right side - contains the submission form */ }
        <div className={ styles.right }>
          <form>
            <div className={ styles.formWrapper }>

              { /* The various fields of the form, which describe the submission */ }
              <TextField 
                fullWidth
                id="all_position"
                inputProps={ { readOnly: true } }
                label="Position"
                value={ submission.all_position }
                variant="filled"
              />
              { submission.position && 
                <TextField 
                  fullWidth
                  id="position"
                  inputProps={ { readOnly: true } }
                  label="Live Position"
                  value={ submission.position }
                  variant="filled"
                />
              }
              <DatePicker 
                disableFuture
                label="Date"
                format="YYYY-MM-DD"
                minDate={ dayjs(game.release_date) }
                value={ form.values.submitted_at ? dayjs(form.values.submitted_at) : form.values.submitted_at }
                onChange={ handleSubmittedAtChange }
                slotProps={{
                  textField: { 
                    color: form.values.submitted_at !== dateB2F(submission.submitted_at) ? "success" : "primary",
                    fullWidth: true,
                    helperText: form.values.submitted_at !== dateB2F(submission.submitted_at) ? updateFieldText : null,
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
                color={ form.values.proof !== submission.proof ? "success" : "primary" }
                fullWidth
                helperText={ form.values.proof !== submission.proof ? updateFieldText : null }
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
                { submission.live !== form.values.live && <FormHelperText>{ updateFieldText }</FormHelperText> }
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
                inputProps={ { readOnly: true } }
                InputProps={ { 
                  endAdornment: submission.comment ? (
                    <IconButton size="small" onClick={ handleToggle }>
                      { form.values.comment ? <ClearRoundedIcon /> : <AddIcon /> }
                    </IconButton>
                  ) : undefined
                } }
                label="Comment"
                multiline
                rows={ TEXT_AREA_ROWS }
                onChange={ handleChange }
                value={ form.values.comment }
                variant="filled"
              />

              { /* Button used to reset the form back to it's original values */ }
              <button className="cancel" type="button" onClick={ () => fillForm() }>Reset Values</button>

              { /* Two buttons: one for approving the submission, and one for deleting. */ }
              <div className={ styles.btns }>
                <button type="submit" disabled={ showReject } onClick={ (e) => onApproveClick(e) }>Approve</button>
                <button type="button" disabled={ showReject } onClick={ () => setShowReject(true) }>Reject</button>
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