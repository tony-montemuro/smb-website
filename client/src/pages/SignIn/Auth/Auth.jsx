/* ===== IMPORTS ===== */
import styles from "./Auth.module.css";
import Email from "./Email.jsx";
import AuthLogic from "./Auth.js";
import Password from "./Password.jsx";
import Links from "./Links.jsx";

function Auth() {
  /* ===== STATES & FUNCTIONS ===== */
  const {
    form,
    error,
    handleChange,
    getButtonText,
    setMode,
    handleSubmit
  } = AuthLogic();


  /* ===== AUTH COMPONENT ===== */
  return (
    <form id={ styles.form } className={ styles.container } onSubmit={ handleSubmit } autoComplete="on">

      { /* Email/password fields: these will render in different ways depending on form.mode */ }
      <div className={ styles.container }>
        <Email email={ form.email } handleEmailChange={ handleChange } isError={ error.email } />
        <Password
          form={ form }
          handleChange={ handleChange }
          mode={ form.mode }
          error={ error }
        />
      </div>

      { /* Submit button, optional error message, & links, which modify form.mode */ }
      <button id={ styles.button } type="submit" disabled={ form.loading }>{ getButtonText() }</button>
      <div className="center">
        { error.message && <span id={ styles.error }>{ error.message }</span> }
      </div>
      <Links mode={ form.mode } setMode={ setMode } />

    </form>
  )
}

/* ===== EXPORTS ===== */
export default Auth;
