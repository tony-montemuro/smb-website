/* ===== IMPORTS ===== */
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AppDataContext, GameContext, UserContext } from "../../../utils/Contexts";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import styles from "./Insert.module.css";
import Checkbox from "@mui/material/Checkbox";
import FancyLevel from "../../../components/FancyLevel/FancyLevel.jsx";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import FormGroup from "@mui/material/FormGroup";
import FrontendHelper from "../../../helper/FrontendHelper";
import InsertLogic from "./Insert.js";
import RecordInput from "./RecordInput";
import TextField from "@mui/material/TextField";
import Username from "../../../components/Username/Username.jsx";
import UserRow from "../../../components/UserRow/UserRow";
import UserSearch from "../../../components/UserSearch/UserSearch.jsx";

function Insert({ level, updateBoard, submitting, setSubmitting, board }) {
  /* ===== CONTEXTS ===== */

  // appData state from app data context
  const { appData } = useContext(AppDataContext);

  // game state from game context
  const { game } = useContext(GameContext);

	// user state & is moderator function from user context
  const { user, isModerator } = useContext(UserContext);

  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { form, handleChange, handleSubmittedAtChange, onUserRowClick, handleSubmit } = InsertLogic(level, setSubmitting); 
  
  // helper functions
  const { capitalize, recordB2F } = FrontendHelper();

  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];
  const type = path[4];
  const otherType = type === "score" ? "time" : "score";
  const userRowOptions = {
    isDetailed: false,
    disableLink: true,
    onUserRowClick: onUserRowClick
  };
  const isPracticeMode = appData.categories[category] ? appData.categories[category].practice : undefined;
  const PROOF_MAX_LENGTH = 256;
  const COMMENT_MAX_LENGTH = 100;
  const COMMENT_ROWS = 2;
  const USERS_PER_PAGE = 5;

  /* ===== INSERT COMPONENT ===== */ 
  return (
    <div className={ styles.insert }>
      <div className={ styles.header }>
        <h1><FancyLevel level={ level.name } /></h1>
        { board.all && board.all.length > 0 && board.filtered && board.filtered.length > 0 &&
          <span>1st: { recordB2F(board.filtered[0].record, type, level.timer_type) }</span>
        }
      </div>

      <div className={ styles.body }>
        
        { /* If current user is a moderator of the current game, render the option to submit on another user's behalf */ }
        { isModerator(abb) &&
          <div className={ styles.profile }>
            <h2>Select a User</h2>
            <UserRow user={ user.profile } onClick={ onUserRowClick } disableLink />
            <h2>OR</h2>
            <UserSearch usersPerPage={ USERS_PER_PAGE } userRowOptions={ userRowOptions } />
          </div>
        }

        { /* Levelboard submit - contains the form header and form for submitting submissions to the database */ }
        <div className={ styles.submit }>

          { /* Form header - specifies the type of submission */ }
          <h2>Submit { capitalize(type) }</h2>

          { /* Submission form - allows users to submit a record to the database */ }
          <form onSubmit={ (e) => handleSubmit(e, level.timer_type, updateBoard) }>
            <div className={ styles.formWrapper }>

              { /* If the current user is a moderator, render the user who the moderator is submitting on behalf of. */ }
              { isModerator(abb) &&
                <div className={ styles.user }>
                  User:&nbsp;
                  <Username profile={ form.values.profile } />
                </div>
              }

              { /* Render all necessary inputs for a submission */ }
              { game.version.length > 0 &&
                <TextField
                  fullWidth
                  id="version_id"
                  label="Game Version"
                  select
                  SelectProps={{ native: true }}
                  onChange={ handleChange }
                  value={ form.values.version }
                  variant="filled"
                >
                  { game.version.map(version => (
                    <option value={ version.id } key={ version.id } >{ version.version }</option>
                  ))}
                </TextField>
              }
              <RecordInput 
                form={ form } 
                handleChange={ handleChange } 
                timerType={ level.timer_type }
                type={ type }
              />
              <DatePicker 
                color={ form.error.submitted_at ? "error" : "primary" }
                disableFuture
                label="Date"
                format="YYYY-MM-DD"
                minDate={ dayjs(game.min_date) }
                value={ form.values.submitted_at ? dayjs(form.values.submitted_at) : form.values.submitted_at }
                onChange={ handleSubmittedAtChange }
                slotProps={{
                  textField: {
                    helperText: form.error.submitted_at ? form.error.submitted_at : null, 
                    fullWidth: true,
                    required: true,
                    variant: "filled"
                  }
                }}
              />
              <TextField
                fullWidth
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
                fullWidth
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
                fullWidth
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
                color={ form.error.proof ? "error" : "primary" }
                fullWidth
                helperText={ form.error.proof ? form.error.proof : "A proof is highly recommended!" }
                id="proof"
                inputProps={ { maxLength: PROOF_MAX_LENGTH } }
                label="Proof"
                placeholder="YouTube, Twitch, X (Twitter), Google Drive, or Imgur URL"
                onChange={ handleChange }
                type="url"
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
                { form.error.live && <FormHelperText error>{ form.error.live }</FormHelperText> }
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
              </FormGroup>
              <TextField
                disabled={ user.profile.id !== form.values.profile.id }
                fullWidth
                helperText={ user.profile.id === form.values.profile.id ? `${ form.values.comment.length }/${ COMMENT_MAX_LENGTH }` : "This field cannot be updated." }
                id="comment"
                inputProps={{ maxLength: COMMENT_MAX_LENGTH }}
                label="Comment"
                multiline
                placeholder="Must be under 100 characters"
                rows={ COMMENT_ROWS }
                onChange={ handleChange }
                value={ form.values.comment }
                variant="filled"
              />
              { user.profile.id !== form.values.profile.id &&
                <TextField
                  fullWidth
                  helperText={ `${ form.values.mod_note.length }/${ COMMENT_MAX_LENGTH }` }
                  id="mod_note"
                  inputProps={{ maxLength: COMMENT_MAX_LENGTH }}
                  label="Moderator Note"
                  multiline
                  placeholder="Must be under 100 characters"
                  rows={ COMMENT_ROWS }
                  onChange={ handleChange }
                  value={ form.values.mod_note }
                  variant="filled"
                />
              }
              { level.chart_type === "both" && isPracticeMode &&
                <FormGroup>
                  <FormControlLabel 
                    control={ 
                      <Checkbox 
                        checked={ form.values.both } 
                        id="both" 
                        onChange={ handleChange } 
                        inputProps={{ "aria-label": "controlled" }} 
                      />
                    } 
                    label={ `Submit ${ capitalize(otherType) }` } 
                  />
                </FormGroup>
              }
              { form.values.both &&
                <>
                  <span><strong>IMPORTANT: </strong>This field should only be filled if the { otherType } also matches the proof submitted.</span>
                  <RecordInput 
                    form={ form } 
                    handleChange={ handleChange } 
                    timerType={ level.timer_type }
                    type={ otherType }
                  />
                </>
              }

              { /* Form submission button: submits the form. NOTE: button is disabled if the submitting state is true. */ }
              <div className="center">
                <button type="submit" disabled={ submitting }>Submit</button>
              </div>
              
            </div>
          </form>
        </div>
      </div>
    
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Insert;