/* ===== IMPORTS ===== */
import { useNavigate } from "react-router-dom";

function NavSignIn() {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();

  /* ===== NAV SIGN IN ===== */
  return (
    <button 
      type="button" 
      id="nav-create-btn" 
      className="nav-button" 
      title="Sign In"
      onClick={ () => navigate("/signin")
    }>
      Sign In
    </button>
  );
};

/* ===== EXPORTS ===== */
export default NavSignIn;