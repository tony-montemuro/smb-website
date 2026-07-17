/* ===== IMPORTS ===== */
import Email from "./Email.jsx";
import AuthLogic from "./Auth.js";
import Password from "./Password.jsx";
import Links from "./Links.jsx";

function Auth() {
  /* ===== STATES & FUNCTIONS ===== */
  const {
    email,
    password,
    mode,
    loading,
    error,
    handleEmailChange,
    handlePasswordChange,
    getButtonText,
    toSignIn,
    toSignUp,
    toForgotPassword,
    handleSubmit
  } = AuthLogic();


  /* ===== AUTH COMPONENT ===== */
  return (
    <form onSubmit={ handleSubmit }>
      <Email email={ email } handleEmailChange={ handleEmailChange } isError={ error.email } />
      <Password password={ password } handlePasswordChange={ handlePasswordChange } mode={ mode } isError={ error.password } />
      <button type="submit" disabled={ loading }>{ getButtonText() }</button>
      { error.message && <span>{ error.message }</span> }
      <Links mode={ mode } signIn={ toSignIn } signUp={ toSignUp } forgotPassword={ toForgotPassword } />
    </form>
  )
}

/* ===== EXPORTS ===== */
export default Auth;
