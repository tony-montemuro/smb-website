/* ===== IMPORTS ===== */
import styles from "./LevelList.module.css";
import FrontendHelper from "../../../helper/FrontendHelper";
import TextField from "@mui/material/TextField";

function LevelInput({ id, level, mode, category, formData, handleChange }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize } = FrontendHelper();
  console.log(formData);

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

      <TextField
        id={ `${ id }_chart_type` }
        label="Chart Type"
        onChange={ e => handleChange() }
        select
        SelectProps={ { native: true } }
        sx={ { width: "fit-content" } }
        value={ level.chart_type }
        variant="filled"
      >
        { formData.chartTypes.map(chartType => (
          <option 
            key={ chartType } 
            value={ chartType } 
          >
            { capitalize(chartType) }
          </option>
        ))}
      </TextField>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelInput;