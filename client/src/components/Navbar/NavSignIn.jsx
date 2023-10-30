/* ===== IMPORTS ===== */
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

function NavSignIn() {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();

  /* ===== NAV SIGN IN ===== */
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
export default NavSignIn;