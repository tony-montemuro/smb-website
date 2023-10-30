/* ===== IMPORTS ===== */
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";

function SignIn() {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();

  /* ===== SIGN IN COMPONENT ===== */
  return (
    <button 
      type="button" 
      className={ styles.btn }
      title="Sign In"
      onClick={ () => navigate("/signin")
    }>
      Sign In
    </button>
  );
};

/* ===== EXPORTS ===== */
export default SignIn;