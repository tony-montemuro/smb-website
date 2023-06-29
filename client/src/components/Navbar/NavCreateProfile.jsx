/* ===== IMPORTS ===== */
import { useNavigate } from "react-router-dom";

function NavCreateProfile() {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();

  /* ===== NAV CREATE PROFILE ===== */
  return (
    <button 
      type="button" 
      id="nav-create-btn" 
      className="nav-button" 
      title="Create Profile"
      onClick={ () => navigate("/profile")
    }>
      Create Profile
    </button>
  );
};

/* ===== EXPORTS ===== */
export default NavCreateProfile;