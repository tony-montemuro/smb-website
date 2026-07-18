/* ===== IMPORTS ===== */
import styles from "./Auth.module.css";
import AuthHelper from "./Auth.js";

function Links({ mode, setMode }) {
  /* ===== VARIABLES ===== */
  const { MODE_SIGNIN, MODE_SIGNUP, MODE_FORGOT_PASSWORD } = AuthHelper();

  if (mode === MODE_SIGNIN) {
    return (
      <div className={ `${styles.container} ${styles.links} center` }>
        <span onClick={ () => setMode(MODE_FORGOT_PASSWORD) }>
          Forgot your password?
        </span>
        <span onClick={ () => setMode(MODE_SIGNUP) }>
          Don't have an account? Sign up
        </span>
      </div>
    );
  }

  return (
    <div className={ `${styles.container} ${styles.links} center` }>
      <span onClick={ () => setMode(MODE_SIGNIN) }>Already have an account? Sign in</span>
    </div>
  );
}

/* ===== EXPORTS ===== */
export default Links;
