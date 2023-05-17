/* ===== IMPORTS ====== */
import "./Login.css";
import LoginLogic from "./Login.js";

function Login() {
  /* ===== STATES AND FUNCTIONS ====== */

  // states and functions from the js file
  const { 
    email, 
    userState,
    handleChange, 
    handleLogin 
  } = LoginLogic();

  /* ===== LOGIN COMPONENT ===== */
  return (
    <div className="login-container">
      <div className="login">

        { /* Login header */ }
        <div className="login-header">
          <h1>Log In / Sign Up</h1>
          <p>Log in or sign up via email below: </p>
        </div>

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

            { /* If there was an error logging in, render it here. */ }
            { email.error && <p>{ email.error }</p> }

            { /* Form button: When pressed, the application will attempt to log the user in.
            If the application is in the processing of logging in, the button will be disabled. */ }
            <button disabled={ userState === "logging" }>Log In</button>

            { /* If the login was a success, render a confirmation message here. */ }
            { userState === "complete" && <p>Success! Please check your email to continue.</p> }

          </form>
        </div>
      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default Login;