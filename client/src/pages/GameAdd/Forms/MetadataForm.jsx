/* ===== IMPORTS ===== */
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Checkbox from "@mui/material/Checkbox";
import Container from "../../../components/Container/Container.jsx";
import dayjs from "dayjs";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import MetadataFormLogic from "./MetadataForm.js";
import styles from "./MetadataForm.module.css";
import TextField from "@mui/material/TextField";
import UserSearch from "../../../components/UserSearch/UserSearch.jsx";

function MetadataForm({ pageNumber, unlockedPages, setUnlockedPages }) {
  /* ===== FUNCTIONS ===== */
  const { 
    form,
    creatorName,
    handleChange,
    handleDateChange,
    updateLocal,
    validateAndUpdate,
    onUserRowClick 
  } = MetadataFormLogic();
  
  /* ===== VARIABLES ===== */
  const ABB_LENGTH_MAX = 12;
  const DATE_MIN = "2000-01-01";
  const NAME_LENGTH_MAX = 256;
  const USERS_PER_PAGE = 5;
  const userRowOptions = {
    isDetailed: false,
    disableLink: true,
    onUserRowClick: onUserRowClick
  };

  /* ===== METADATA FORM COMPONENT ===== */
  return (
    
    <Container title="Main Information">
      <form onSubmit={ validateAndUpdate } className={ styles.metadataForm }>
        <TextField 
          color={ form.error.name ? "error" : "primary" }
          error={ form.error.name }
          id="name"
          inputProps={{ maxLength: NAME_LENGTH_MAX }}
          helperText={ form.error.name ? form.error.name : `${ form.values.name.length }/${ NAME_LENGTH_MAX }` }
          label="Name"
          placeholder={ `Must be ${ NAME_LENGTH_MAX } characters or less` }
          onChange={ handleChange }
          required
          value={ form.values.name }
          variant="filled"
        />

        <TextField 
          color={ form.error.abb ? "error" : "primary" }
          error={ form.error.abb }
          id="abb"
          inputProps={{ maxLength: ABB_LENGTH_MAX }}
          helperText={ form.error.abb ? form.error.abb : `${ form.values.abb.length }/${ ABB_LENGTH_MAX }` }
          label="Abbreviation"
          placeholder={ `Must be ${ ABB_LENGTH_MAX } characters or less` }
          onChange={ handleChange }
          required
          value={ form.values.abb }
          variant="filled"
        />

        <DatePicker 
          disableHighlightToday
          disableFuture
          format="YYYY-MM-DD"
          label="Release Date"
          minDate={ dayjs(DATE_MIN) }
          onChange={ handleDateChange }
          slotProps={{
            field: { clearable: false },
            textField: { variant: "filled" }
          }}
          value={ dayjs(form.values.release_date) }
        />

        <FormGroup>
          <FormControlLabel 
            control={
              <Checkbox  
                checked={ form.values.live_preference }
                id="live_preference"
                onChange={ handleChange } 
                inputProps={{ "aria-label": "controlled" }} 
              />
            } 
            label="Should this game prefer live submissions?" 
          />
        </FormGroup>

        <FormGroup>
          <FormControlLabel 
            control={
              <Checkbox  
                checked={ form.values.custom }
                id="custom"
                onChange={ handleChange }
                inputProps={{ "aria-label": "controlled" }} 
              />
            } 
            label="Is this a custom game?" 
          />
        </FormGroup>

        { /* Only render certain fields if this is a custom game */ }
        { form.values.custom && 
          <>
            <DatePicker 
              disableHighlightToday
              disableFuture
              format="YYYY-MM-DD"
              label="Minimum Date"
              minDate={ dayjs(DATE_MIN) }
              onChange={ handleDateChange }
              slotProps={{
                field: { clearable: false },
                textField: { variant: "filled" }
              }}
              value={ dayjs(form.values.release_date) }
            />

            <TextField 
              color={ form.error.download ? "error" : "primary" }
              error={ form.error.download }
              id="download"
              helperText={ form.error.download && form.error.download }
              label="Download URL"
              onChange={ handleChange }
              required
              value={ form.values.download === null ? "" : form.values.download }
              variant="filled"
            />

            <TextField 
              id="creator_name"
              label="Creator"
              readOnly
              value={ creatorName }
              variant="filled"
            />

            <div className={ styles.userSearch }>
              <UserSearch usersPerPage={ USERS_PER_PAGE } userRowOptions={ userRowOptions } />
            </div>
          </> 
        }

        <button type="submit">Validate</button>
      </form>
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default MetadataForm;