/* ===== IMPORTS ===== */
import styles from"./PasswordReset.module.css";
import PasswordResetLogic from "./PasswordReset.js";
import TextField from "@mui/material/TextField";

function PasswordReset() {
  /* ===== VARIABLES ===== */
  const limitMessage = "Must be between 12 and 64 characters long";
  const PASSWORD_MIN_LENGTH = 12;
  const PASSWORD_MAX_LENGTH = 64;

  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { form, handleChange, handleSubmit } = PasswordResetLogic();

  /* ===== PASSWORD RESET COMPONENT ===== */
  return (
    <div className={ styles.passwordReset }>
      <h1>Password Reset</h1>
      <form className={ styles.form } onSubmit={ handleSubmit }>
        <div className={ styles.formWrapper }>

          { /* Render a text field for both form fields */ }
          <TextField 
            color={ form.error.password ? "error" : "primary" }
            fullWidth
            helperText={ form.error.password ? form.error.password : null }
            id="password"
            inputProps={ { minLength: PASSWORD_MIN_LENGTH, maxLength: PASSWORD_MAX_LENGTH } }
            label="Password"
            placeholder={ limitMessage }
            onChange={ handleChange }
            type="password"
            value={ form.values.password }
            variant="filled"
          />
          <TextField 
            color={ form.error.confirmation ? "error" : "primary" }
            fullWidth
            helperText={ form.error.confirmation ? form.error.confirmation : null }
            id="confirmation"
            inputProps={ { minLength: PASSWORD_MIN_LENGTH, maxLength: PASSWORD_MAX_LENGTH } }
            label="Confirm Password"
            placeholder={ limitMessage }
            onChange={ handleChange }
            type="password"
            value={ form.values.confirmation }
            variant="filled"
          />

          { /* Button that submits the form */ }
          <button type="submit" disabled={ !form.values.password || !form.values.confirmation || form.submitting }>Reset Password</button>

        </div>
      </form>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default PasswordReset;