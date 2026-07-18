/* ===== IMPORTS ===== */
import { MessageContext } from "../../../utils/Contexts";
import { supabase } from "../../../database/SupabaseClient.jsx";
import { useContext, useState } from "react";

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
  const defaultForm = {
    email: "",
    password: "",
    confirmPassword: "",
    mode: MODE_SIGNIN,
    loading: false
  };

  /* ===== CONTEXTS ===== */
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES ===== */
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState(defaultError);

  /* ===== FUNCTIONS ===== */
  // FUNCTION 1: handleChange - handle changes to form inputs 
  // PRECONDITIONS (1 parameter):
  // 1.) e: an event object generated when the user makes a change to the email input 
  // POSTCONDITIONS (1 possible outcome):
  // the relevant part of the form state hook is updated based on e.target.value,
  // as well as e.target.name. the error state hook is also updated accordingly
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    let err = { ...error, email: false };
    if (name.toLowerCase().includes("password")) {
      err = { ...error, password: false, confirmPassword: false };
    }
    setError(err);
  }

  // FUNCTION 2: getButtonText - get text for form button
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (3 possible outcomes):
  // based on the 3 possible modes, return the appropriate button text
  const getButtonText = () => {
    switch (form.mode) {
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


  // FUNCTION 3: setMode - set mode field of form state hook
  // PRECONDITIONS (1 parameter):
  // 1.) mode: a string, one of the 3 (MODE_FORGOT_PASSWORD, MODE_SIGNIN, MODE_SIGNUP)
  // POSTCONDITIONS (1 possible outcome):
  // the mode field of the form state hook is update to be `mode`, &
  // the error state hook is reset
  const setMode = mode => {
    setForm({ ...form, mode: mode });
    setError(defaultError);
  }

  // FUNCTION 4: setLoading - set loading field of form state hook
  // PRECONDITIONS (1 parameter):
  // 1.) isLoading: a bool, determines whether form is in loading state or not
  // POSTCONDITIONS (1 possible outcome):
  // the loading field of the form state hook is update to be `loading`
  const setLoading = isLoading => {
    setForm({ ...form, loading: isLoading });
  }

  // FUNCTION 5: handleSubmit - function that executes when user submits form
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

    let success;
    switch (form.mode) {
      case MODE_SIGNIN:
        await signIn();
        setLoading(false);
        return;
      case MODE_SIGNUP:
        success = await signUp();
        break;
      case MODE_FORGOT_PASSWORD:
        success = await passwordReset();
        break;
    }

    if (!success) {
      setLoading(false);
      return;
    }

    setForm(defaultForm);
  }

  // FUNCTION 6: signIn - function that signs in user
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (2 possible outcomes)
  // if sign in is successful, user is informed that the sign in was successful, and
  // they are redirected to the home screen.
  // if unsuccessful, error message is rendered to the user
  const signIn = async () => {
    const { email, password } = form;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError({ email: true, password: true, message: error.message });
      return
    }

    addMessage("Login successful!", "success", 5000);
  }

  // FUNCTION 7: signIn - function that signs up user
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (2 possible outcomes)
  // if sign up is successful, user is informed that they can find an email to proceed, &
  // true is returned
  // if unsuccessful, error message is rendered to user, and false is returned 
  const signUp = async () => {
    const { email, password, confirmPassword } = form;
    if (password !== confirmPassword) {
      setError({ password: true, confirmPassword: true, message: "Passwords don't match." });
      return false;
    }

    const options = { emailRedirectTo: window.location.origin };

    const { data: { user, session }, error } = await supabase.auth.signUp({
      email,
      password,
      options
    });

    if (error) {
      setError({ email: true, password: true, confirmPassword: true, message: error.message });
      return false;
    }

    if (user && !session) {
      addMessage("Success! Check your email for the confirmation link.");
    }

    return true;
  }

  // FUNCTION 8: passwordReset - function that resets user password
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (2 possible outcomes)
  // if password reset is successful, user is informed that they can find an email to proceed,
  // and true is returned
  // if unsuccessful, error message is rendered to user, and false is returned 
  const passwordReset = async () => {
    const { email } = form;
    const options = { redirectTo: `${window.location.origin}/profile` };

    const { error } = await supabase.auth.resetPasswordForEmail(email, options);

    if (error) {
      setError({ email: true, message: error.message });
      return false;
    }

    addMessage("Success! Check your email for the password reset link.");
    return true;
  }

  return {
    MODE_SIGNIN,
    MODE_SIGNUP,
    MODE_FORGOT_PASSWORD,
    form,
    error,
    handleChange,
    getButtonText,
    setMode,
    handleSubmit
  };
}

/* ===== EXPORTS ===== */
export default Auth;
