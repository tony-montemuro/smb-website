/* ===== IMPORTS ===== */
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";

function SignIn() {
  /* ===== VARIABLES ===== */
  const navigateTo = useNavigate();

  /* ===== SIGN IN COMPONENT ===== */
  return (
    <button 
      type="button" 
      className={ styles.btn }
      title="Sign In"
      onClick={ () => navigateTo("/signin")}
    >
      Sign In
    </button>
  );
};

/* ===== EXPORTS ===== */
export default SignIn;