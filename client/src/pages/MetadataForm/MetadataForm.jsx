/* ===== IMPORTS ===== */
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useEffect } from "react";
import Checkbox from "@mui/material/Checkbox";
import Container from "../../components/Container/Container.jsx";
import dayjs from "dayjs";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import MetadataFormLogic from "./MetadataForm.js";
import styles from "./MetadataForm.module.css";
import TextField from "@mui/material/TextField";
import UserSearch from "../../components/UserSearch/UserSearch.jsx";

function MetadataForm() {
  /* ===== FUNCTIONS ===== */
  const { 
    form,
    creatorName,
    populateForm,
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

  /* ===== EFFECTS ===== */
  useEffect(() => {
    populateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== METADATA FORM COMPONENT ===== */
  return (
    
    <Container title="Main Information">
      <form onSubmit={ validateAndUpdate } className={ styles.metadataForm }>
        <TextField 
          id="name"
          inputProps={{ maxLength: NAME_LENGTH_MAX }}
          helperText={ `${ form.values.name.length }/${ NAME_LENGTH_MAX }` }
          label="Name"
          placeholder={ `Must be ${ NAME_LENGTH_MAX } characters or less` }
          onBlur={ updateLocal }
          onChange={ handleChange }
          required
          value={ form.values.name }
          variant="filled"
        />

        <TextField 
          color={ form.error.abb ? "error" : "primary" }
          error={ form.error.abb ? true : false }
          id="abb"
          inputProps={{ maxLength: ABB_LENGTH_MAX }}
          helperText={ form.error.abb ? form.error.abb : `${ form.values.abb.length }/${ ABB_LENGTH_MAX }` }
          label="Abbreviation"
          placeholder={ `Must be ${ ABB_LENGTH_MAX } characters or less` }
          onBlur={ updateLocal }
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
          onBlur={ updateLocal } // used here for calendar date entry
          onChange={ (e) => handleDateChange(e, "release_date") }
          slotProps={{
            field: { clearable: false },
            textField: { 
              helperText: form.error.release_date && form.error.release_date,
              variant: "filled", 
              onBlur: updateLocal // onBlur here for manual date entry
            }
          }}
          value={ dayjs(form.values.release_date) }
        />

        <FormGroup>
          <FormControlLabel 
            control={
              <Checkbox  
                checked={ form.values.live_preference }
                id="live_preference"
                onBlur={ updateLocal }
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
                onBlur={ updateLocal }
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
              id="min_date"
              label="Minimum Date"
              minDate={ dayjs(DATE_MIN) }
              onBlur={ updateLocal } // used here for calendar date entry
              onChange={ (e) => handleDateChange(e, "min_date") }
              slotProps={{
                field: { clearable: false },
                textField: { variant: "filled", onBlur: updateLocal } // onBlur here for manual date entry
              }}
              value={ dayjs(form.values.min_date) }
            />

            <TextField 
              id="download"
              label="Download URL"
              onBlur={ updateLocal }
              onChange={ handleChange }
              required
              value={ form.values.download === null ? "" : form.values.download }
              variant="filled"
            />

            <TextField 
              id="creator_name"
              label="Creator"
              readOnly
              required
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