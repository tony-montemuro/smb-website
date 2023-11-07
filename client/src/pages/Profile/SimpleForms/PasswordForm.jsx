/* ===== IMPORTS ===== */
import styles from"./SimpleForms.module.css";
import Container from "../../../components/Container/Container.jsx";
import PasswordFormLogic from "./PasswordForm.js";
import TextField from "@mui/material/TextField";

function PasswordForm() {
  /* ===== VARIABLES ===== */
  const limitMessage = "Must be between 12 and 64 characters long";
  const PASSWORD_MIN_LENGTH = 12;
  const PASSWORD_MAX_LENGTH = 64;

  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { form, handleChange, handleSubmit } = PasswordFormLogic();

  /* ===== PASSWORD FORM COMPONENT ===== */
  return (
    <div id="password-reset">
      <Container title="Password Reset">
        <form onSubmit={ handleSubmit }>
          <div className={ styles.form }>

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
      </Container>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default PasswordForm;