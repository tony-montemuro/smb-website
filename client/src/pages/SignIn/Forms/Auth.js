/* ===== IMPORTS ===== */
import { MessageContext } from "../../../utils/Contexts";
import { supabase } from "../../../database/SupabaseClient.jsx";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  /* ===== VARIABLES ===== */
  const MODE_SIGNIN = "signin";
  const MODE_SIGNUP = "signup";
  const MODE_FORGOT_PASSWORD = "forgot_password";
  const defaultError = {
    email: false,
    password: false,
    confirmPassword: false,
    message: ""
  };
  const navigateTo = useNavigate();

  /* ===== CONTEXTS ===== */
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES ===== */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState(MODE_SIGNIN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(defaultError);

  /* ===== FUNCTIONS ===== */

  // FUNCTION 1: handleChange - handle changes to the email input 
  // PRECONDITIONS (1 parameter):
  // 1.) e: an event object generated when the user makes a change to the email input 
  // POSTCONDITIONS (1 possible outcome):
  // the email state hook is updated based on e.target.value
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError({ ...error, email: false });
  }

  // FUNCTION 2: handleChange - handle changes to the password input 
  // PRECONDITIONS (1 parameter):
  // 1.) e: an event object generated when the user makes a change to the password input 
  // POSTCONDITIONS (1 possible outcome):
  // the password state hook is updated based on e.target.value
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError({ ...error, password: false, confirmPassword: false });
  }

  // FUNCTION 3: handleChange - handle changes to the password input 
  // PRECONDITIONS (1 parameter):
  // 1.) e: an event object generated when the user makes a change to the password input 
  // POSTCONDITIONS (1 possible outcome):
  // the password state hook is updated based on e.target.value
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setError({ ...error, password: false, confirmPassword: false });
  }

  // FUNCTION 4: getButtonText - get text for form button
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


  // FUNCTION 5: toSignIn - change mode to MODE_SIGNIN
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (1 possible outcome):
  // the mode statehook is update to MODE_SIGNIN
  const toSignIn = () => {
    setMode(MODE_SIGNIN);
  }

  // FUNCTION 6: toSignUp - change mode to MODE_SIGNUP
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (1 possible outcome):
  // the mode statehook is update to MODE_SIGNUP
  const toSignUp = () => {
    setMode(MODE_SIGNUP);
  }

  // FUNCTION 7: toForgotPassword - change mode to MODE_HANDLE_PASSWORD
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (1 possible outcome):
  // the mode statehook is update to MODE_HANDLE_PASSWORD
  const toForgotPassword = () => {
    setMode(MODE_FORGOT_PASSWORD);
  }

  // FUNCTION 8: handleSubmit - function that executes when user submits form
  // PRECONDITIONS (1 parameter):
  // 1.) e: event object generated when the user submits the form
  // POSTCONDITIONS (2 possible outcomes):
  // The action performed is based on the mode. If successful, the desired action is performed,
  // & the user will be informed of any next steps.
  // If unsuccessful, an error message is rendered to the user.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(defaultError);

    switch (mode) {
      case MODE_SIGNIN:
        await signIn();
        break;
      case MODE_SIGNUP:
        await signUp();
        break;
      case MODE_FORGOT_PASSWORD:
        await passwordReset();
        break;
    }

    setLoading(false);
  }

  // FUNCTION 9: signIn - function that signs in user
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (2 possible outcomes)
  // if sign in is successful, user is informed that the sign in was successful, and
  // they are redirected to the home screen.
  // if unsuccessful, error message is rendered to the user
  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError({ email: true, password: true, message: error.message });
      return
    }

    addMessage("Sign in successful!");
    navigateTo("/");
  }

  // FUNCTION 10: signIn - function that signs up user
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (2 possible outcomes)
  // if sign up is successful, user is informed that they can find an email to proceed
  // if unsuccessful, error message is rendered to user 
  const signUp = async () => {
    if (password !== confirmPassword) {
      setError({ password: true, confirmPassword: true, message: "Passwords don't match." });
      return;
    }

    const options = { emailRedirectTo: window.location.origin };

    const { data: { user, session }, error } = await supabase.auth.signUp({
      email,
      password,
      options
    });

    if (error) {
      setError({ email: true, password: true, message: error.message });
      return;
    }

    if (user && !session) {
      addMessage("Success! Check your email for the confirmation link.");
    }
  }

  // FUNCTION 11: passwordReset - function that resets user password
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (2 possible outcomes)
  // if password reset is successful, user is informed that they can find an email to proceed
  // if unsuccessful, error message is rendered to user 
  const passwordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setError({ email: true, message: error.message });
      return
    }

    addMessage("Success! Check your email for the password reset link.");
  }

  return {
    MODE_SIGNIN,
    MODE_SIGNUP,
    MODE_FORGOT_PASSWORD,
    email,
    password,
    confirmPassword,
    mode,
    loading,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    getButtonText,
    toSignIn,
    toSignUp,
    toForgotPassword,
    handleSubmit
  };
}

/* ===== EXPORTS ===== */
export default Auth;
