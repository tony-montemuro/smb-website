/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function LevelboardButton({ abb, category, type, levelName }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== LEVELBOARD BUTTON COMPONENT ===== */
  return (
    <Link to={ `/games/${ abb }/${ category }/${ type }/${ levelName }` }>
      <button>{ capitalize(type) }</button>
    </Link>
  );
};

/* ===== EXPORTS ===== */
export default LevelboardButton;