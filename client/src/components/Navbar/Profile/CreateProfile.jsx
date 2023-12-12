/* ===== IMPORTS ===== */
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";

function CreateProfile() {
  /* ===== VARIABLES ===== */
  const navigateTo = useNavigate();

  /* ===== CREATE PROFILE COMPONENT ===== */
  return (
    <button 
      type="button" 
      className={ styles.btn }
      title="Create Profile"
      onClick={ () => navigateTo("/profile") }
    >
      Create Profile
    </button>
  );
};

/* ===== EXPORTS ===== */
export default CreateProfile;