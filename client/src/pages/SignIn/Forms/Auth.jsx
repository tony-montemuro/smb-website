/* ===== IMPORTS ===== */
import styles from "./Auth.module.css";
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
    <form id={ styles.form } className={ styles.container } onSubmit={ handleSubmit } autoComplete="on">
      <div className={ styles.container }>
        <Email email={ email } handleEmailChange={ handleEmailChange } isError={ error.email } />
        <Password password={ password } handlePasswordChange={ handlePasswordChange } mode={ mode } isError={ error.password } />
      </div>
      <button id={ styles.button } type="submit" disabled={ loading }>{ getButtonText() }</button>
      <div className="center">
        { error.message && <span id={ styles.error }>{ error.message }</span> }
      </div>
      <Links mode={ mode } signIn={ toSignIn } signUp={ toSignUp } forgotPassword={ toForgotPassword } />
    </form>
  )
}

/* ===== EXPORTS ===== */
export default Auth;
