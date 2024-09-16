/* ===== IMPORTS ===== */
import styles from "./GoalAddForm.module.css";
import Goal from "../../assets/svg/Goal.jsx";
import GoalAddFormLogic from "./GoalAddForm";
import TextField from "@mui/material/TextField";

function GoalAddForm({ submitting, setSubmitting }) {
  /* ===== VARIABLES ===== */
  const NAME_LENGTH_MAX = 15;

  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { form, handleChange, handleSubmit } = GoalAddFormLogic(setSubmitting);

  /* ===== GOAL ADD FORM COMPONENT ===== */
  return (
    <div className={ styles.goalAddForm }>
      <h1>Add New Goal</h1>
      <form className={ styles.form } onSubmit={ handleSubmit }>
        <TextField
          color={ form.error ? "error" : "primary" }
          error={ form.error ? true : false }
          id="name"
          helperText={ form.error ? form.error : `${ form.values.name.length }/${ NAME_LENGTH_MAX }` }
          inputProps={{ maxLength: NAME_LENGTH_MAX }}
          label="Goal Color Name"
          onChange={ handleChange }
          placeholder="Please only use lowercase letters"
          required
          value={ form.values.name }
          variant="filled"
        />
        
        <div className={ styles.color }>
          <input 
            id="color"
            onChange={ handleChange }
            required
            type="color"
            value={ form.values.color }
          />
          <Goal goal={ form.values } />
        </div>

        <button type="submit" disabled={ submitting }>Submit</button>
      </form> 
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GoalAddForm;