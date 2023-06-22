/* ===== IMPORTS ====== */
import "./Login.css";
import LoginLogic from "./Login.js";

function Login() {
  /* ===== STATES AND FUNCTIONS ====== */

  // states and functions from the js file
  const { 
    email, 
    submitting,
    handleChange, 
    handleLogin 
  } = LoginLogic();

  /* ===== LOGIN COMPONENT ===== */
  return (
    <div className="login">

      { /* Login form: allows user to sign in via email account */ }
      <div className="login-form">
        <form onSubmit={ handleLogin }>
          <div className="login-email-field">

            { /* Email input: a place for the user to enter their email account */ }
            <label htmlFor="email">Email: </label>
            <input 
              id="email"
              type="email"
              placeholder="Your email"
              value={ email.name }
              onChange={ handleChange } 
            />
          </div>

          { /* Form button: When pressed, the application will attempt to log the user in.
          If the application is in the processing of logging in, the button will be disabled. */ }
          <button type="submit" disabled={ submitting }>Submit</button>

        </form>
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Login;