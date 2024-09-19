/* ===== IMPORTS ===== */
import style from "./CategoryAddForm.module.css";
import CategoryAddFormLogic from "./CategoryAddForm.js";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import TextField from "@mui/material/TextField";

function CategoryAddForm({ submitting, setSubmitting }) {
  /* ===== VARIABLES ===== */
  const ABB_LENGTH_MAX = 15;
  const NAME_LENGTH_MAX = 50;

  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { form, handleChange, handleSubmit } = CategoryAddFormLogic(setSubmitting);

  /* ===== CATEGORY ADD FORM COMPONENT ===== */
  return (
    <div className={ style.categoryAddForm }>
      <h1>Add New Category</h1>
      <form className={ style.form } onSubmit={ handleSubmit }>
        <TextField
          helperText={ `${ form.values.name.length }/${ NAME_LENGTH_MAX }` }
          id="name"
          inputProps={ { maxLength: NAME_LENGTH_MAX } }
          label="Category Name"
          onChange={ handleChange }
          placeholder={ `Must be ${ NAME_LENGTH_MAX } characters or less` }
          required
          value={ form.values.name }
          variant="filled"
        />
        <TextField
          color={ form.error.abb ? "error" : "primary" }
          error={ form.error.abb ? true : false }
          helperText={ form.error.abb ? form.error.abb : `${ form.values.abb.length }/${ ABB_LENGTH_MAX }` }
          id="abb"
          inputProps={ { maxLength: ABB_LENGTH_MAX } }
          label="Category Abbreviation"
          onChange={ handleChange }
          placeholder={ `Must be ${ ABB_LENGTH_MAX } characters or less` }
          required
          value={ form.values.abb }
          variant="filled"
        />
        <FormGroup>
          <FormControlLabel 
            control={ 
              <Checkbox 
                checked={ form.values.practice } 
                id="practice" 
                onChange={ handleChange } 
                inputProps={{ "aria-label": "controlled" }} 
              />
            } 
            label="Practice Mode Style" 
          />
        </FormGroup>
        <button type="submit" disabled={ submitting }>Submit</button>
      </form>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default CategoryAddForm;