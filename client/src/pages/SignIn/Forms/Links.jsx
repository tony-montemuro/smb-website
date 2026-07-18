/* ===== IMPORTS ===== */
import styles from "./Auth.module.css";
import AuthHelper from "./Auth.js";

function Links({ mode, signIn, signUp, forgotPassword }) {
  /* ===== VARIABLES ===== */
  const { MODE_SIGNIN } = AuthHelper();

  if (mode === MODE_SIGNIN) {
    return (
      <div className={ `${styles.container} ${styles.links} center` }>
        <span onClick={ forgotPassword }>
          Forgot your password?
        </span>
        <span onClick={ signUp }>
          Don't have an account? Sign up
        </span>
      </div>
    );
  }

  return (
    <div className={ `${styles.container} ${styles.links} center` }>
      <span onClick={ signIn }>Already have an account? Sign in</span>
    </div>
  );
}

/* ===== EXPORTS ===== */
export default Links;
