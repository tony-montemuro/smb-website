/* ===== IMPORTS ===== */
import EmailInfoFormLogic from "./EmailInfoForm";

function EmailInfoForm() {
  /* ===== STATES & FUNCTIONS ===== */
  
  // states and functions from the js file
  const { email, handleChange, handleEmailUpdate } = EmailInfoFormLogic();

  /* ===== EMAIL INFO FORM COMPONENT ===== */
  return (
    <div className="profile-email-info">

      { /* Form header */ }
      <h2>Update Email</h2>
      <p><b>Note: </b>For security reasons, you will be required to validate an email from both your current address, as well as the new address you provide.</p>
    
      { /* Email Update form: allows user to sign in via email account */ }
      <form onSubmit={ handleEmailUpdate }>
        <div>

          { /* Email input: a place for the user to enter their email account */ }
          <label htmlFor="email">Email: </label>
          <input 
            id="email"
            type="email"
            placeholder="Your new email"
            value={ email.name }
            onChange={ handleChange } 
          />
        </div>

        { /* If there was an error logging in, render it here. */ }
        { email.error && <p>Error: { email.error }</p> }

        { /* Form button: When pressed, the application will attempt to log the user in.
        If the application is in the processing of logging in, the button will be disabled. */ }
        <button type="submit" disabled={ email.submitting }>Update Email</button>

      </form>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default EmailInfoForm;