/* ===== IMPORTS ===== */
import styles from "./LevelList.module.css";
import TextField from "@mui/material/TextField";

function LevelInput({ id, level, mode, category, handleChange }) {
  /* ===== LEVEL INPUT COMPONENT ===== */
  return (
    <div className={ styles.levelInput }>
      <TextField
        id={ `${ id }_name` }
        label="Name"
        onChange={ e => handleChange() }
        value={ level.name }
        variant="filled"
      />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelInput;