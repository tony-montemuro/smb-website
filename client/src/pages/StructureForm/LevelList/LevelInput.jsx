/* ===== IMPORTS ===== */
import { CategoriesContext } from "../../../utils/Contexts.js";
import { useContext } from "react";
import styles from "./LevelList.module.css";
import AddIcon from "@mui/icons-material/Add";
import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import LevelHelper from "../../../helper/LevelHelper.js";
import LevelInputLogic from "./LevelInput.js";
import FrontendHelper from "../../../helper/FrontendHelper";
import TextField from "@mui/material/TextField";

function LevelInput({ id, level, formData, category, mode, handleBlur, handleChange, handleInsert, handleDelete, error }) {
  /* ===== CONTEXTS ===== */

  // categories state from categories context
  const { categories } = useContext(CategoriesContext);

  /* ===== VARIABLES ===== */
  const scoreChartTypes = ["both", "score"];
  const timeChartTypes = ["both", "time"];
  const isPracticeMode = categories[category].practice;

  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { timerTypeB2F } = LevelInputLogic();

  // helper variables & functions
  const { capitalize } = FrontendHelper();
  const { goals, levelB2F } = LevelHelper();

  /* ===== LEVEL INPUT COMPONENT ===== */
  return (
    <div>
      <div className={ styles.levelInput }>
        <TextField
          className={ styles.nameInput }
          id={ `${ id }-name` }
          label="Name"
          onBlur={ () => handleBlur() }
          onChange={ e => handleChange(e) }
          value={ levelB2F(level.name) }
          variant="filled"
        />

        <TextField
          id={ `${ id }-goal` }
          label="Goal"
          onBlur={ () => handleBlur() }
          onChange={ e => handleChange(e) }
          select
          SelectProps={ { native: true } }
          value={ level.goal }
          variant="filled"
        >
          <option key="" value=""></option>
          { goals.map(goal => (
            <option
              key={ goal }
              value={ goal }
            >
              { capitalize(goal) }
            </option>
          ))}
        </TextField>

        <TextField
          className={ styles.chartTypeInput }
          id={ `${ id }-chart_type` }
          label="Chart Type"
          onBlur={ () => handleBlur() }
          onChange={ e => handleChange(e) }
          select
          SelectProps={ { native: true } }
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
          onBlur={ () => handleBlur() }
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

        <TextField
          disabled={ level.chart_type === "score" || timeChartTypes.includes(level.ascending) }
          id={ `${ id }-time` }
          label="Time (sec.)"
          onBlur={ () => handleBlur() }
          onChange={ e => handleChange(e) }
          type="number"
          value={ level.time }
          variant="filled"
        />

        { !isPracticeMode && 
          <>
            <FormGroup>
              <FormControlLabel 
                control={ 
                  <Checkbox 
                    checked={ scoreChartTypes.includes(level.ascending) } 
                    disabled={ level.chart_type === "time" }
                    id={ `${ id }-ascending.score` } 
                    onBlur={ () => handleBlur() }
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
                    onBlur={ () => handleBlur() }
                    onChange={ e => handleChange(e) } 
                    inputProps={{ "aria-label": "controlled" }} 
                  />
                } 
                label="Ascend Time"
              />
            </FormGroup>
          </>
        }

        <button
          type="button"
          title="Add chart"
          className={ `${ styles.levelListBtn } center` }
          onClick={ () => handleInsert(category, mode, level.id+1) }
        >
          <AddIcon />
        </button>

        <button
          type="button"
          title="Delete chart"
          className={ `${ styles.levelListBtn } center` }
          onClick={ () => handleDelete(level.id) }
        >
          <DeleteIcon />
        </button>
      </div>

      { error &&
        <FormHelperText error>{ error }</FormHelperText>
      }
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelInput;