/* ===== IMPORTS ===== */
import styles from "./LevelList.module.css";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import LevelHelper from "../../../helper/LevelHelper.js";
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
  const { levelB2F } = LevelHelper();

  /* ===== LEVEL INPUT COMPONENT ===== */
  return (
    <div className={ styles.levelInput }>
      <TextField
        id={ `${ id }-name` }
        label="Name"
        onChange={ e => handleChange(e) }
        value={ levelB2F(level.name) }
        variant="filled"
      />

      <TextField
        id={ `${ id }-chart_type` }
        label="Chart Type"
        onChange={ e => handleChange(e) }
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
        disabled={ level.chart_type === "score" }
        id={ `${ id }-timer_type` }
        label="Timer Type"
        onChange={ e => handleChange(e) }
        select
        SelectProps={ { native: true } }
        value={ level.timer_type }
        variant="filled"
      >
        <option key="" value=""></option>
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
              disabled={ level.chart_type === "time" }
              id={ `${ id }-ascending.score` } 
              onChange={ e => handleChange(e) } 
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
              disabled={ level.chart_type === "score" }
              id={ `${ id }-ascending.time` } 
              onChange={ e => handleChange(e) } 
              inputProps={{ "aria-label": "controlled" }} 
            />
          } 
          label="Ascend Time"
        />
      </FormGroup>

      <TextField
        disabled={ level.chart_type === "score" || timeChartTypes.includes(level.ascending) }
        id={ `${ id }-time` }
        label="Time"
        onChange={ e => handleChange(e) }
        type="number"
        value={ level.time }
        variant="filled"
      />

      <button
        type="button" 
        className={ styles.levelListBtn } 
        onChange={ e => handleChange(e) }
      >
        Delete
      </button>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelInput;