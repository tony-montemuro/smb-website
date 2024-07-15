/* ===== IMPORTS ===== */
import styles from "./LevelList.module.css";

function LevelInput({ level, mode, category, handleChange }) {
  /* ===== LEVEL INPUT COMPONENT ===== */
  return (
    <div className={ styles.levelInput }>
      { level.id }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelInput;