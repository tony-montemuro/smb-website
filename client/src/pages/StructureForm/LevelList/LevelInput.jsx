/* ===== IMPORTS ===== */
import styles from "./LevelList.module.css";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import LevelInputLogic from "./LevelInput.js";
import FrontendHelper from "../../../helper/FrontendHelper";
import TextField from "@mui/material/TextField";

function LevelInput({ id, level, mode, category, formData, handleChange }) {
  /* ===== FUNCTIONS ===== */
  const scoreChartTypes = ["both", "score"];
  const timeChartTypes = ["both", "time"];

  // functions from the js file
  const { timerTypeB2F } = LevelInputLogic();

  // helper functions
  const { capitalize } = FrontendHelper();

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

      <TextField
        id={ `${ id }_timer_type` }
        label="Timer Type"
        onChange={ e => handleChange() }
        select
        SelectProps={ { native: true } }
        sx={ { width: "fit-content" } }
        value={ level.timer_type }
        variant="filled"
      >
        { formData.timerTypes.map(timerType => (
          <option
            key={ timerType }
            value={ timerType }
          >
            { timerTypeB2F(timerType) }
          </option>
        ))}
      </TextField>

      <FormGroup>
        <FormControlLabel 
          control={ 
            <Checkbox 
              checked={ scoreChartTypes.includes(level.ascending) } 
              disabled={ level.chartType === "time" }
              id={ `${ id }_ascending_score` } 
              onChange={ handleChange } 
              inputProps={{ "aria-label": "controlled" }} 
            />
          } 
          label="Ascend Score" 
        />
      </FormGroup>

      <FormGroup>
        <FormControlLabel 
          control={ 
            <Checkbox 
              checked={ timeChartTypes.includes(level.ascending) } 
              disabled={ level.chartType === "score" }
              id={ `${ id }_ascending_time` } 
              onChange={ handleChange } 
              inputProps={{ "aria-label": "controlled" }} 
            />
          } 
          label="Ascend Time"
        />
      </FormGroup>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelInput;