/* ===== IMPORTS ===== */
import { useState } from "react";

const Auth = () => {
  /* ===== VARIABLES ===== */
  const MODE_SIGNIN = "signin";
  const MODE_SIGNUP = "signup";
  const MODE_FORGOT_PASSWORD = "forgot_password";

  /* ===== STATES ===== */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState(MODE_FORGOT_PASSWORD);

  /* ===== FUNCTIONS ===== */

  // FUNCTION 1: handleChange - handle changes to the email input 
  // PRECONDITIONS (1 parameter):
  // 1.) e: an event object generated when the user makes a change to the email input 
  // POSTCONDITIONS (1 possible outcome):
  // the email state hook is updated based on e.target.value
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  }

  // FUNCTION 2: handleChange - handle changes to the password input 
  // PRECONDITIONS (1 parameter):
  // 1.) e: an event object generated when the user makes a change to the password input 
  // POSTCONDITIONS (1 possible outcome):
  // the password state hook is updated based on e.target.value
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  }

  // FUNCTION 3: getButtonText - get text for form button
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (3 possible outcomes):
  // based on the 3 possible modes, return the appropriate button text
  const getButtonText = () => {
    switch (mode) {
      case MODE_SIGNIN:
        return "Sign In";
      case MODE_SIGNUP:
        return "Sign Up";
      case MODE_FORGOT_PASSWORD:
        return "Send reset password instructions";
      default:
        return "";
    }
  }


  // FUNCTION 4: toSignIn - change mode to MODE_SIGNIN
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (1 possible outcome):
  // the mode statehook is update to MODE_SIGNIN
  const toSignIn = () => {
    setMode(MODE_SIGNIN);
  }

  // FUNCTION 5: toSignUp - change mode to MODE_SIGNUP
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (1 possible outcome):
  // the mode statehook is update to MODE_SIGNUP
  const toSignUp = () => {
    setMode(MODE_SIGNUP);
  }

  // FUNCTION 6: toForgotPassword - change mode to MODE_HANDLE_PASSWORD
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (1 possible outcome):
  // the mode statehook is update to MODE_HANDLE_PASSWORD
  const toForgotPassword = () => {
    setMode(MODE_FORGOT_PASSWORD);
  }

  return {
    MODE_SIGNIN,
    MODE_SIGNUP,
    MODE_FORGOT_PASSWORD,
    email,
    password,
    mode,
    handleEmailChange,
    handlePasswordChange,
    getButtonText,
    toSignIn,
    toSignUp,
    toForgotPassword
  };
}

/* ===== EXPORTS ===== */
export default Auth;
