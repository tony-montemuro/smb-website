/* ===== IMPORTS ===== */
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

function NavCreateProfile() {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();

  /* ===== NAV CREATE PROFILE ===== */
  return (
    <button 
      type="button" 
      className={ styles.btn }
      title="Create Profile"
      onClick={ () => navigate("/profile")
    }>
      Create Profile
    </button>
  );
};

/* ===== EXPORTS ===== */
export default NavCreateProfile;