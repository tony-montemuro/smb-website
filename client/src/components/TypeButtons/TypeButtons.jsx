/* ===== IMPORTS ===== */
import { useNavigate } from "react-router-dom";
import styles from "./TypeButtons.module.css";

function TypeButtons({ abb, category, level }) {
  /* ===== VARIABLES ===== */
  const navigateTo = useNavigate();

  /* ===== TYPE BUTTONS COMPONENT ===== */
  return (
    <div className={ styles.typeBtns }>

      {/* Score button */}
      { (level.chart_type === "both" || level.chart_type === "score") &&
        <button type="button" onClick={ () => navigateTo(`/games/${ abb }/${ category }/score/${ level.name }`) }>
          Score
        </button>
      }

      {/* Time button */}
      { (level.chart_type === "time" || level.chart_type === "both") &&
        <button type="button" onClick={ () => navigateTo(`/games/${ abb }/${ category }/time/${ level.name }`) }>
          Time
        </button>
      }

    </div>
  );
};

/* ===== EXPORTS ===== */
export default TypeButtons;