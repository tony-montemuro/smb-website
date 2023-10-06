/* ===== IMPORTS ===== */
import styles from "./SimpleForms.module.css";
import Container from "../../../components/Container/Container.jsx";
import EmailInfoFormLogic from "./EmailInfoForm";
import TextField from "@mui/material/TextField";

function EmailInfoForm() {
  /* ===== STATES & FUNCTIONS ===== */
  
  // states and functions from the js file
  const { email, handleChange, handleEmailUpdate } = EmailInfoFormLogic();

  /* ===== EMAIL INFO FORM COMPONENT ===== */
  return (
    <Container title="Update Email" isLargeHeader={ false }>
      <form className={ styles.form } onSubmit={ handleEmailUpdate }>
        <span><b>Note: </b>For security reasons, you will be required to validate an email from both your current address, as well as the new address you provide.</span>
        <TextField 
          color={ email.error ? "error" : "primary" }
          error={ email.error ? true : false }
          fullWidth
          id="email"
          helperText={ email.error }
          label="Email"
          placeholder="Your new email"
          onChange={ handleChange }
          type="email"
          value={ email.name }
          variant="filled"
        />
        { email.error && <p id={ styles.error }>Error: { email.error }</p> }
        <button type="submit" disabled={ email.submitting }>Update Email</button>
      </form>
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default EmailInfoForm;