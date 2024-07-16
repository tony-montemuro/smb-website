/* ===== IMPORTS ===== */
import styles from "./ModeList.module.css";
import { cloneElement } from "react";
import TextField from "@mui/material/TextField";

function ModeInput({ id, mode, category, handleChange, children }) {
  /* ===== VARIABLES ===== */
  const categoryName = category.category;

  /* ===== MODE INPUT COMPONENT ===== */
  return (
    <div>
      <div className={ styles.modeInput }>
        <TextField
          id={ id }
          label="Mode"
          onChange={ e => handleChange(e.target.value, categoryName, mode.id) }
          value={ mode.name }
          variant="filled"
        />
        <button type="button" onClick={ () => handleChange("", categoryName, mode.id) }>Delete</button>
      </div>
      { cloneElement(children, { mode: mode, category: category }) }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeInput;