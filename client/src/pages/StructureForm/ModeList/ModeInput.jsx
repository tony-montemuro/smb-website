/* ===== IMPORTS ===== */
import styles from "./ModeList.module.css";
import { cloneElement } from "react";
import TextField from "@mui/material/TextField";

function ModeInput({ mode, category, handleChange, children }) {
  /* ===== MODE INPUT COMPONENT ===== */
  return (
    <div>
      <div className={ styles.modeInput }>
        <TextField
          id={ `mode_${ category }_${ mode.id }` }
          label="Mode"
          onChange={ e => handleChange(e.target.value, category, mode.id) }
          value={ mode.name }
          variant="filled"
        />
        <button type="button" onClick={ () => handleChange("", category, mode.id) }>Delete</button>
      </div>
      { cloneElement(children, { mode: mode, category: category }) }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeInput;