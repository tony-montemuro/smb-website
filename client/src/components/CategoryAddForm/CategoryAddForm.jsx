/* ===== IMPORTS ===== */
import style from "./CategoryAddForm.module.css";
import CategoryAddFormLogic from "./CategoryAddForm.js";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import TextField from "@mui/material/TextField";

function CategoryAddForm({ submitting, setSubmitting, refreshCategoryDataFunc }) {
  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { form, handleChange, handleSubmit } = CategoryAddFormLogic(setSubmitting, refreshCategoryDataFunc);

  /* ===== CATEGORY ADD FORM COMPONENT ===== */
  return (
    <div className={ style.categoryAddForm }>
      <h1>Add New Category</h1>
      <form className={ style.form } onSubmit={ handleSubmit }>
        <TextField
          id="name"
          label="Category Name"
          onChange={ handleChange }
          required
          value={ form.values.name }
          variant="filled"
        />
        <TextField
          id="abb"
          label="Category Abbreviation"
          onChange={ handleChange }
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default CategoryAddForm;