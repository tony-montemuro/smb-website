/* ===== IMPORTS ===== */
import { AppDataContext } from "../../../utils/Contexts.js";
import { useContext, useEffect } from "react";
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

  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { localState, setLocalState, updateLocalState } = LevelInputHelper(level);

  /* ===== EFFECTS ===== */

  // code that re-updates the local state each time the id is changed
  useEffect(() => {
    setLocalState(level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // helper variables & functions
  const { capitalize, timerTypeB2F } = FrontendHelper();
  const { levelB2F } = LevelHelper();

  /* ===== VARIABLES ===== */
  const categoryName = category.category;
  const scoreChartTypes = ["both", "score"];
  const timeChartTypes = ["both", "time"];
  const isPracticeMode = appData.categories[categoryName].practice;
  const chartType = localState.chart_type;
  const id = `level-${ category.id }-${ mode.id }-${ level.id }`;
  const LEVEL_LENGTH_MAX = 80;
  let timeTitle;
  if (chartType === "score") {
    timeTitle = "Score charts cannot have a time.";
  }
  if (timeChartTypes.includes(localState.ascending)) {
    timeTitle = "Ascending time charts cannot have a time.";
  }

  /* ===== LEVEL INPUT COMPONENT ===== */
  return (
    <div>
      <div className={ styles.levelInput }>
        <TextField
          className={ styles.nameInput }
          id={ `${ id }-name` }
          inputProps={{ maxLength: LEVEL_LENGTH_MAX }}
          helperText={ `${ localState.name.length }/${ LEVEL_LENGTH_MAX }` }
          label="Name"
          onBlur={ () => handleBlur(localState) }
          onChange={ e => updateLocalState(e) }
          placeholder={ `Must be ${ LEVEL_LENGTH_MAX } characters or less` }
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
          disabled={ chartType === "score" }
          id={ `${ id }-timer_type` }
          label="Timer Type"
          onBlur={ () => handleBlur(localState) }
          onChange={ e => updateLocalState(e) }
          select
          SelectProps={ { native: true } }
          title={ chartType === "score" ? "Score charts cannot have a timer type." : null }
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
          disabled={ chartType === "score" || timeChartTypes.includes(localState.ascending) }
          id={ `${ id }-time` }
          label="Time (sec.)"
          onBlur={ () => handleBlur(localState) }
          onChange={ e => updateLocalState(e) }
          title={ timeTitle }
          type="number"
          value={ localState.time }
          variant="filled"
        />

        { !isPracticeMode && 
          <div className={ styles.ascend }>
            <FormGroup title={ chartType === "time" ? "Cannot ascend score if chart type is time." : null }>
              <FormControlLabel 
                control={ 
                  <Checkbox 
                    checked={ scoreChartTypes.includes(localState.ascending) } 
                    disabled={ chartType === "time" }
                    id={ `${ id }-ascending.score` }
                    inputProps={{ "aria-label": "controlled" }} 
                    onBlur={ () => handleBlur(localState) }
                    onChange={ e => updateLocalState(e) }
                  />
                } 
                label="Ascend Score" 
              />
            </FormGroup>

            <FormGroup title={ chartType === "score" ? "Cannot ascend time if chart type is score." : null }>
              <FormControlLabel 
                control={ 
                  <Checkbox 
                    checked={ timeChartTypes.includes(localState.ascending) }
                    disabled={ chartType === "score" }
                    id={ `${ id }-ascending.time` }
                    inputProps={{ "aria-label": "controlled" }}
                    onBlur={ () => handleBlur(localState) }
                    onChange={ e => updateLocalState(e) }
                  />
                } 
                label="Ascend Time"
              />
            </FormGroup>
          </div>
        }

        <div className={ styles.btns }>
          <button
            type="button"
            title="Add chart"
            className={ `${ styles.levelListBtn } center` }
            onClick={ () => handleInsert(categoryName, mode, level.id+1) }
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
      </div>

      { error &&
        <FormHelperText error>{ error }</FormHelperText>
      }
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelInput;