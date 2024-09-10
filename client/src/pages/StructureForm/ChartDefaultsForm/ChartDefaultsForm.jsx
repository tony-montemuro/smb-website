/* ===== IMPORTS ===== */
import styles from "./ChartDefaultsForm.module.css";
import { AppDataContext, GameAddContext } from "../../../utils/Contexts.js";
import { useContext } from "react";
import Checkbox from "@mui/material/Checkbox";
import ExpansionPanel from "../../../components/ExpansionPanel/ExpansionPanel.jsx";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FrontendHelper from "../../../helper/FrontendHelper.js";
import Loading from "../../../components/Loading/Loading.jsx";
import LevelHelper from "../../../helper/LevelHelper.js";
import TextField from "@mui/material/TextField";

function ChartDefaultsForm({ chartDefaults, handleChange }) {
  /* ===== VARIABLES ===== */
  const scoreChartTypes = ["both", "score"];
  const timeChartTypes = ["both", "time"];

  /* ===== CONTEXTS ===== */

  // app data state from app data context
  const { appData } = useContext(AppDataContext);

  // structure data state from game add context
  const { structureData } = useContext(GameAddContext);

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, timerTypeB2F } = FrontendHelper();
  const { levelB2F } = LevelHelper();

  /* ===== CHART DEFAULTS COMPONENT ===== */
  return (
    <ExpansionPanel title="Chart Default Values">
      <div className={ styles.formWrapper }>
        { structureData ?
          <>
            <span>
              <em>To save time, you can modify the default values that appear each time you create a new chart.</em>
            </span>
            <div className={ styles.form }>
              <TextField
                className={ styles.nameInput }
                id="name"
                label="Name"
                onChange={ handleChange }
                value={ levelB2F(chartDefaults.name) }
                variant="filled"
              />

              <TextField
                className={ styles.dropdown }
                id="goal"
                label="Goal"
                onChange={ handleChange }
                select
                SelectProps={ { native: true } }
                value={ chartDefaults.goal }
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
                id="chart_type"
                label="Chart Type"
                onChange={ handleChange }
                select
                SelectProps={ { native: true } }
                value={ chartDefaults.chart_type }
                variant="filled"
              >
                { structureData.chartTypes.map(chartType => (
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
                disabled={ chartDefaults.chart_type === "score" }
                id="timer_type"
                label="Timer Type"
                onChange={ handleChange }
                select
                SelectProps={ { native: true } }
                value={ chartDefaults.timer_type }
                variant="filled"
              >
                <option key="" value=""></option>
                { structureData.timerTypes.map(timerType => (
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
                disabled={ chartDefaults.chart_type === "score" || timeChartTypes.includes(chartDefaults.ascending) }
                id="time"
                label="Time (sec.)"
                onChange={ handleChange }
                type="number"
                value={ chartDefaults.time }
                variant="filled"
              />

              <FormGroup>
                <FormControlLabel 
                  control={ 
                    <Checkbox 
                      checked={ scoreChartTypes.includes(chartDefaults.ascending) } 
                      disabled={ chartDefaults.chart_type === "time" }
                      id="ascending_score" 
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
                      checked={ timeChartTypes.includes(chartDefaults.ascending) } 
                      disabled={ chartDefaults.chart_type === "score" }
                      id="ascending_time" 
                      onChange={ handleChange } 
                      inputProps={{ "aria-label": "controlled" }} 
                    />
                  } 
                  label="Ascend Time"
                />
              </FormGroup>
            </div>
          </>
        :
          <Loading />
        }
      </div>

    </ExpansionPanel>
  );
};

/* ===== EXPORTS ===== */
export default ChartDefaultsForm;