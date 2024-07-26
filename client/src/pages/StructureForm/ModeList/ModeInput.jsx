/* ===== IMPORTS ===== */
import styles from "./ModeList.module.css";
import { cloneElement } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
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
        <button
          type="button"
          title="Add mode"
          onClick={ () => handleInsert(category, mode.id+1) }
          className="center"
        >
          <AddIcon />
        </button>
        <button 
          type="button"
          title="Delete mode"
          onClick={ () => handleDelete(mode.id) }
          className="center"
        >
          <DeleteIcon />
        </button>
      </div>
      { cloneElement(children, { mode: mode, category: category }) }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeInput;