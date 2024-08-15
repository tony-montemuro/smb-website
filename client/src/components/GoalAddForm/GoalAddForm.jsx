/* ===== IMPORTS ===== */
import styles from "./GoalAddForm.module.css";
import GoalAddFormLogic from "./GoalAddForm";
import TextField from "@mui/material/TextField";

function GoalAddForm() {
  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { form, handleChange, handleSubmit } = GoalAddFormLogic();

  /* ===== GOAL ADD FORM COMPONENT ===== */
  return (
    <div className={ styles.goalAddForm }>
      <h1>Add New Goal</h1>
      <form className={ styles.form } onSubmit={ handleSubmit }>
        <TextField
          id="name"
          label="Goal Name"
          onChange={ handleChange }
          required
          value={ form.values.name }
          variant="filled"
        />
        <input 
          id="color"
          onChange={ handleChange }
          required
          type="color"
          value={ form.values.color }
        />
      </form> 
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GoalAddForm;