/* ===== IMPORTS ===== */
import styles from "./ModeList.module.css";
import { cloneElement } from "react";
import TextField from "@mui/material/TextField";

function ModeInput({ id, mode, category, handleChange, handleInsert, handleDelete, children }) {
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
        <button type="button" onClick={ () => handleInsert(category, mode.id+1) }>Add</button>
        <button type="button" onClick={ () => handleDelete(mode.id) }>Delete</button>
      </div>
      { cloneElement(children, { mode: mode, category: category }) }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeInput;