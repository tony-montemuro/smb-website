/* ===== IMPORTS ===== */
import styles from "./EntityAddForm.module.css";
import FrontendHelper from "../../helper/FrontendHelper";
import TextField from "@mui/material/TextField";

function EntityAddForm() {
  /* ===== VARIABLES ===== */
  const RULE_HEIGHT = 8;
  const RULE_MAX_LENGTH = 1024;

  /* ===== ENTITY ADD FORM ===== */
  return (
    <div className={ styles.entityAddForm }>
      <h1>Add New Entities</h1>

      { /* Monkey form */ }
      <SingleFieldForm entityName="monkey" handleChange={ () => {} } handleSubmit={ () => {} } />

      { /* Platform form */ }
      <form className={ styles.form }>
        <span><strong>Platform</strong></span>
        <TextField
          id="platform_name"
          label="Platform"
          onChange={ () => {} }
          required
          value={ null }
          variant="filled"
        />
        <TextField
          id="platform_abb"
          label="Platform Abbreviation"
          onChange={ () => {} }
          required
          value={ null }
          variant="filled"
        />
        <button type="submit" onClick={ () => {} }>Add</button>
      </form>

      <SingleFieldForm entityName="region" handleChange={ () => {} } handleSubmit={ () => {} } />
      <form className={ styles.form }>
        <span><strong>Rule</strong></span>
        <TextField
          fullWidth
          // helperText={ `${ form.values.body.length }/${ BODY_MAX_LENGTH }` }
          id="rule_name"
          inputProps={ { maxLength: RULE_MAX_LENGTH } }
          label="Rule"
          multiline
          placeholder={ `Must be under ${ RULE_MAX_LENGTH } characters` }
          rows={ RULE_HEIGHT }
          onChange={ () => {} }
          required
          value={ null }
          variant="filled"
        />
        <button type="submit" onClick={ () => {} }>Add</button>
      </form>

    </div>
  );
};

function SingleFieldForm({ entityName, handleChange, handleSubmit }) {
  /* ===== FUNCTIONS ===== */
  const { capitalize } = FrontendHelper();

  /* ===== VARIABLES ===== */
  const capitalizedEntityName = capitalize(entityName);

  /* ===== SINGLE FIELD FORM COMPONENT ===== */
  return (
    <form className={ styles.form }>
      <span><strong>{ capitalizedEntityName }</strong></span>
      <TextField 
        id={ `${ entityName }_name` }
        label={ capitalizedEntityName }
        onChange={ handleChange }
        required
        value={ null }
        variant="filled"
      />
      <button type="submit" onClick={ () => handleSubmit(entityName) }>Add</button>
    </form>
  );
};

/* ===== EXPORTS ===== */
export default EntityAddForm;