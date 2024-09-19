/* ===== IMPORTS ===== */
import styles from "./EntityAddForm.module.css"; 
import EntitiyAddFormLogic from "./EntityAddForm.js";
import FrontendHelper from "../../helper/FrontendHelper";
import TextField from "@mui/material/TextField";

function EntityAddForm({ submitting, setSubmitting, refreshSelectDataFunc }) {
  /* ===== VARIABLES ===== */
  const MONKEY_MAX_LENGTH = 20;
  const PLATFORM_NAME_MAX_LENGTH = 30;
  const PLATFORM_ABB_MAX_LENGTH = 10;
  const REGION_MAX_LENGTH = 10;
  const RULE_HEIGHT = 8;
  const RULE_MAX_LENGTH = 1024;

  /* ===== STATES & VARIABLES ===== */
  const { form, handleChange, handleSubmit } = EntitiyAddFormLogic(setSubmitting, refreshSelectDataFunc);

  /* ===== ENTITY ADD FORM ===== */
  return (
    <div className={ styles.entityAddForm }>
      <h1>Add New Entities</h1>

      { /* Monkey form */ }
      <SingleFieldForm 
        entityName="monkey"
        form={ form } 
        handleChange={ handleChange } 
        handleSubmit={ handleSubmit }
        disabled={ submitting }
        maxLength={ MONKEY_MAX_LENGTH }
      />

      { /* Platform form */ }
      <form id="platform" className={ styles.form } onSubmit={ handleSubmit }>
        <span><strong>Platform</strong></span>
        <TextField
          id="platform_name"
          helperText={ `${ form.platform.platform_name.length }/${ PLATFORM_NAME_MAX_LENGTH }` }
          inputProps={ { maxLength: PLATFORM_NAME_MAX_LENGTH } }
          label="Platform"
          onChange={ handleChange }
          placeholder={ `Must be under ${ PLATFORM_NAME_MAX_LENGTH } characters` }
          required
          value={ form.platform.platform_name }
          variant="filled"
        />
        <TextField
          id="platform_abb"
          helperText={ `${ form.platform.platform_abb.length }/${ PLATFORM_ABB_MAX_LENGTH }` }
          inputProps={ { maxLength: PLATFORM_ABB_MAX_LENGTH } }
          label="Platform Abbreviation"
          onChange={ handleChange }
          placeholder={ `Must be under ${ PLATFORM_ABB_MAX_LENGTH } characters` }
          required
          value={ form.platform.platform_abb }
          variant="filled"
        />
        <button type="submit" disabled={ submitting }>Add</button>
      </form>

      <SingleFieldForm 
        entityName="region" 
        form={ form }
        handleChange={ handleChange } 
        handleSubmit={ handleSubmit }
        disabled={ submitting }
        maxLength={ REGION_MAX_LENGTH }
      />
      <form id="rule" className={ styles.form } onSubmit={ handleSubmit }>
        <span><strong>Rule</strong></span>
        <TextField
          fullWidth
          helperText={ `${ form.rule.rule_name.length }/${ RULE_MAX_LENGTH }` }
          id="rule_name"
          inputProps={ { maxLength: RULE_MAX_LENGTH } }
          label="Rule"
          multiline
          placeholder={ `Must be under ${ RULE_MAX_LENGTH } characters` }
          rows={ RULE_HEIGHT }
          onChange={ handleChange }
          required
          value={ form.rule.rule_name }
          variant="filled"
        />
        <button type="submit" disabled={ submitting }>Add</button>
      </form>

    </div>
  );
};

function SingleFieldForm({ entityName, form, handleChange, handleSubmit, disabled, maxLength }) {
  /* ===== FUNCTIONS ===== */
  const { capitalize } = FrontendHelper();

  /* ===== VARIABLES ===== */
  const capitalizedEntityName = capitalize(entityName);
  const value = form[entityName][`${ entityName }_name`];

  /* ===== SINGLE FIELD FORM COMPONENT ===== */
  return (
    <form id={ entityName } className={ styles.form } onSubmit={ handleSubmit }>
      <span><strong>{ capitalizedEntityName }</strong></span>
      <TextField 
        id={ `${ entityName }_name` }
        helperText={ `${ value.length }/${ maxLength }` }
        inputProps={ { maxLength } }
        label={ capitalizedEntityName }
        onChange={ handleChange }
        placeholder={ `Must be under ${ maxLength } characters` }
        required
        value={ value }
        variant="filled"
      />
      <button type="submit" disabled={ disabled }>Add</button>
    </form>
  );
};

/* ===== EXPORTS ===== */
export default EntityAddForm;