/* ===== IMPORTS ===== */
import styles from "./ModeList.module.css";
import { cloneElement } from "react";
import TextField from "@mui/material/TextField";

function ModeInput({ mode, category, handleChange, domId, children }) {
  /* ===== MODE INPUT COMPONENT ===== */
  return (
    <div>
      <div className={ styles.modeInput }>
        <TextField
          id={ `mode_${ category }_${ domId }` }
          label="Mode"
          onChange={ e => handleChange(e.target.value, category, mode.id) }
          value={ mode.name }
          variant="filled"
        />
        <button type="button" onClick={ () => handleChange("", category, mode.id) }>Delete</button>
      </div>
      { cloneElement(children) }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeInput;