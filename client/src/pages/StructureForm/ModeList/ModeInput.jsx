/* ===== IMPORTS ===== */
import styles from "./ModeList.module.css";
import { cloneElement } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import FormHelperText from "@mui/material/FormHelperText";
import LevelHelper from "../../../helper/LevelHelper.js";
import TextField from "@mui/material/TextField";

function ModeInput({ id, firstModeId, mode, category, handleBlur, handleChange, handleInsert, handleDelete, error = null, children }) {
  /* ===== VARIABLES ===== */
  const categoryName = category.category;
  const modeId = mode.id;
  const backgroundColors = [
    "rgba(192, 192, 192, 0.1)",
    "rgba(192, 192, 192, 0.2)",
    "rgba(192, 192, 192, 0.3)"
  ];
  const weight = (modeId-firstModeId) % backgroundColors.length;

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { levelB2F } = LevelHelper();

  /* ===== MODE INPUT COMPONENT ===== */
  return (
    <div className={ styles.modeInputWrapper } style={ { backgroundColor: backgroundColors[weight] } }>
      <div className={ styles.modeInput }>
        <TextField
          id={ id }
          label="Mode"
          onBlur={ () => handleBlur() }
          onChange={ e => handleChange(e.target.value, categoryName, modeId) }
          value={ levelB2F(mode.name) }
          variant="filled"
        />

        <button
          type="button"
          title="Add mode"
          onClick={ () => handleInsert(category, modeId+1) }
          className="center"
        >
          <AddIcon />
        </button>
        <button 
          type="button"
          title="Delete mode"
          onClick={ () => handleDelete(modeId) }
          className="center"
        >
          <DeleteIcon />
        </button>

      </div>

      { error &&
        <FormHelperText error>{ error }</FormHelperText>
      }
      
      { cloneElement(children, { mode, category }) }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeInput;