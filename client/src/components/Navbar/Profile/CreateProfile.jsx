/* ===== IMPORTS ===== */
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";

function CreateProfile() {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();

  /* ===== CREATE PROFILE COMPONENT ===== */
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
export default CreateProfile;