/* ===== IMPORTS ===== */
import styles from "./FancyLevel.module.css";
import Goal from "../../assets/svg/Goal.jsx";
import FancyLevelLogic from "./FancyLevel.js";

function FancyLevel({ level }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { getNameAndGoal } = FancyLevelLogic();

  /* ===== VARIABLES ===== */
  const { levelName, goal } = getNameAndGoal(level);

  /* ===== FANCY LEVEL COMPONENT ===== */
  return (
    <div className={ styles.fancyLevel }>
      <span className={ styles.text }>{ levelName }</span>
      <Goal goal={ goal } />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default FancyLevel;
