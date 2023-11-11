/* ===== IMPORTS ===== */
import styles from "./FancyLevel.module.css";
import GoalIcon from "../../assets/svg/Icons/GoalIcon.jsx";
import FancyLevelLogic from "./FancyLevel.js";

function FancyLevel({ level, size = "small" }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { getNameAndGoal } = FancyLevelLogic();

  /* ===== VARIABLES ===== */
  const { levelName, goal } = getNameAndGoal(level);

  /* ===== FANCY LEVEL COMPONENT ===== */
  return (
    <div className={ styles.fancyLevel }>
      <span>
        <span className={ styles.txt }>{ levelName }</span>
        <GoalIcon goal={ goal } size={ size } />
      </span>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default FancyLevel;
