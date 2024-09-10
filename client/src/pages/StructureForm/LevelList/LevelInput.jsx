/* ===== IMPORTS ===== */
import { AppDataContext } from "../../../utils/Contexts.js";
import { useContext } from "react";
import styles from "./LevelList.module.css";
import AddIcon from "@mui/icons-material/Add";
import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import LevelHelper from "../../../helper/LevelHelper.js";
import LevelInputHelper from "./LevelInput.js";
import FrontendHelper from "../../../helper/FrontendHelper";
import TextField from "@mui/material/TextField";

function LevelInput({ level, formData, category, mode, handleBlur, handleInsert, handleDelete, error }) {
  /* ===== CONTEXTS ===== */

  // appData state from app data context
  const { appData } = useContext(AppDataContext);

  /* ===== VARIABLES ===== */
  const categoryName = category.category;
  const scoreChartTypes = ["both", "score"];
  const timeChartTypes = ["both", "time"];
  const isPracticeMode = appData.categories[categoryName].practice;

  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { localState, updateLocalState } = LevelInputHelper(level);

  // helper variables & functions
  const { capitalize, timerTypeB2F } = FrontendHelper();
  const { levelB2F } = LevelHelper();

  /* ===== VARIABLES ===== */
  const id = `level-${ category.id }-${ mode.id }-${ level.id }`;

  /* ===== LEVEL INPUT COMPONENT ===== */
  return (
    <div>
      <div className={ styles.levelInput }>
        <TextField
          className={ styles.nameInput }
          id={ `${ id }-name` }
          label="Name"
          onBlur={ () => handleBlur(localState) }
          onChange={ e => updateLocalState(e) }
          value={ levelB2F(localState.name) }
          variant="filled"
        />

        <TextField
          className={ styles.dropdown }
          id={ `${ id }-goal` }
          label="Goal"
          onBlur={ () => handleBlur(localState) }
          onChange={ e => updateLocalState(e) }
          select
          SelectProps={ { native: true } }
          value={ localState.goal }
          variant="filled"
        >
          <option key="" value=""></option>
          { appData.goals.map(goal => (
            <option
              key={ goal.name }
              value={ goal.name }
            >
              { capitalize(goal.name) }
            </option>
          ))}
        </TextField>

        <TextField
          className={ styles.dropdown }
          id={ `${ id }-chart_type` }
          label="Chart Type"
          onBlur={ () => handleBlur(localState) }
          onChange={ e => updateLocalState(e) }
          select
          SelectProps={ { native: true } }
          value={ localState.chart_type }
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
          className={ styles.wideDropdown }
          disabled={ localState.chart_type === "score" }
          id={ `${ id }-timer_type` }
          label="Timer Type"
          onBlur={ () => handleBlur(localState) }
          onChange={ e => updateLocalState(e) }
          select
          SelectProps={ { native: true } }
          value={ localState.timer_type }
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
          className={ styles.dropdown }
          disabled={ localState.chart_type === "score" || timeChartTypes.includes(localState.ascending) }
          id={ `${ id }-time` }
          label="Time (sec.)"
          onBlur={ () => handleBlur(localState) }
          onChange={ e => updateLocalState(e) }
          type="number"
          value={ localState.time }
          variant="filled"
        />

        { !isPracticeMode && 
          <>
            <FormGroup>
              <FormControlLabel 
                control={ 
                  <Checkbox 
                    checked={ scoreChartTypes.includes(localState.ascending) } 
                    disabled={ localState.chart_type === "time" }
                    id={ `${ id }-ascending.score` } 
                    onBlur={ () => handleBlur(localState) }
                    onChange={ e => updateLocalState(e) } 
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
                    checked={ timeChartTypes.includes(localState.ascending) } 
                    disabled={ localState.chart_type === "score" }
                    id={ `${ id }-ascending.time` } 
                    onBlur={ () => handleBlur(localState) }
                    onChange={ e => updateLocalState(e) }  
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
          onClick={ () => handleInsert(categoryName, mode, localState.id+1) }
        >
          <AddIcon />
        </button>

        <button
          type="button"
          title="Delete chart"
          className={ `${ styles.levelListBtn } center` }
          onClick={ () => handleDelete(localState.id) }
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