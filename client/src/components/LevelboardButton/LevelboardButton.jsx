/* ===== IMPORTS ===== */
import FrontendHelper from "../../helper/FrontendHelper";

function LevelboardButton({ abb, category, type, levelName, onClickFunc }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== LEVELBOARD BUTTON COMPONENT ===== */
  return (
    <button onClick={ () => onClickFunc(abb, category, type, levelName) }>{ capitalize(type) }</button>
  );
};

/* ===== EXPORTS ===== */
export default LevelboardButton;