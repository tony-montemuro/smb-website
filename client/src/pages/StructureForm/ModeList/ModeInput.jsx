/* ===== IMPORTS ===== */
import styles from "./ModeList.module.css";
import { cloneElement } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FormHelperText from "@mui/material/FormHelperText";
import LevelHelper from "../../../helper/LevelHelper.js";
import TextField from "@mui/material/TextField";

function ModeInput({ 
  id,
  firstModeId,
  mode,
  category,
  isVisibleCharts,
  setVisibleCharts,
  handleBlur,
  handleChange,
  handleInsert,
  handleDelete,
  error = null,
  children
}) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { levelB2F } = LevelHelper();

  /* ===== VARIABLES ===== */
  const categoryName = category.category;
  const modeId = mode.id;
  const backgroundColors = [
    "rgba(192, 192, 192, 0.1)",
    "rgba(192, 192, 192, 0.2)",
    "rgba(192, 192, 192, 0.3)"
  ];
  const weight = (modeId-firstModeId) % backgroundColors.length;
  const MODE_LENGTH_MAX = 50;
  const modeName = levelB2F(mode.name);

  /* ===== MODE INPUT COMPONENT ===== */
  return (
    <div className={ styles.modeInputWrapper } style={ { backgroundColor: backgroundColors[weight] } }>
      <div className={ styles.modeInput }>
        <TextField
          className={ styles.name }
          id={ id }
          inputProps={{ maxLength: MODE_LENGTH_MAX }}
          helperText={ `${ modeName.length }/${ MODE_LENGTH_MAX }` }
          label="Mode"
          onBlur={ () => handleBlur() }
          onFocus={ () => setVisibleCharts(modeId) }
          onChange={ e => handleChange(e.target.value, categoryName, modeId) }
          placeholder={ `Must be ${ MODE_LENGTH_MAX } characters or less` }
          value={ levelB2F(modeName) }
          variant="filled"
        />

        <div className={ styles.btns }>
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
          <button
            type="button"
            title={ isVisibleCharts ? "Hide charts" : "Show charts" }
            onClick={ () => isVisibleCharts ? setVisibleCharts(null) : setVisibleCharts(modeId) }
            className="center"
            id={ styles.toggleCharts }
          >
            { isVisibleCharts ? <ExpandMoreRoundedIcon sx={{ color: "white" }} /> : <ExpandLessRoundedIcon sx={{ color: "white" }} /> }
          </button>
        </div>

      </div>

      { error &&
        <FormHelperText error>{ error }</FormHelperText>
      }
      
      { isVisibleCharts && cloneElement(children, { mode, category }) }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeInput;