/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";


function RecordInput({ form, handleChange, timerType }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const type = location.pathname.split("/")[4];

  /* ===== RECORD INPUT COMPONENT ===== */

  // If type is score, we simply render a record input that allows user to enter a number.
  if (type === "score") {
    return (
      <div className="levelboard-input-group">
        <label htmlFor="record">Score: </label>
        <input 
          id="record"
          className="levelboard-submit-record"
          type="number"
          min="0"
          step="1"
          value={ form.values.record }
          onChange={ (e) => handleChange(e) }
        />

        { /* If the error.record field is defined, render that underneath the record field. */ }
        { form.error.record && <p>{ form.error.record }</p> }

      </div>
    );
  }

  // Otherwise, we render an input for each possible time 
  return (
    <>

      { /* If the timerType string includes the substring "hour", render an input for hours */ }
      { timerType.includes("hour") &&
        <div className="levelboard-input-group">
          <label htmlFor="hour">Hours: </label>
          <input 
            id="hour"
            className="levelboard-submit-record"
            type="number"
            min="0"
            step="1"
            value={ form.values.hour }
            onChange={ (e) => handleChange(e) }
          />

          { /* If the error.hour field is defined, render that underneath the hour field. */ }
          { form.error.hour && <p>{ form.error.hour }</p> }

        </div>
      }

      { /* If the timerType string includes the substring "min", render an input for minutes */ }
      { timerType.includes("min") &&
        <div className="levelboard-input-group">
          <label htmlFor="minute">Minutes: </label>
          <input 
            id="minute"
            className="levelboard-submit-record"
            type="number"
            min="0"
            step="1"
            value={ form.values.minute }
            onChange={ (e) => handleChange(e) }
          />

          { /* If the error.minute field is defined, render that underneath the minute field. */ }
          { form.error.minute && <p>{ form.error.minute }</p> }

        </div>
      }

      { /* If the timerType string includes the substring "sec", render an input for seconds */ }
      { timerType.includes("sec") &&
        <div className="levelboard-input-group">
          <label htmlFor="second">Seconds: </label>
          <input 
            id="second"
            className="levelboard-submit-record"
            type="number"
            min="0"
            step="1"
            value={ form.values.second }
            onChange={ (e) => handleChange(e) }
          />

          { /* If the error.second field is defined, render that underneath the second field. */ }
          { form.error.second && <p>{ form.error.second }</p> }

        </div>
      }

      { /* If the timerType string includes the substring "csec", render an input for centiseconds */ }
      { timerType.includes("csec") &&
        <div className="levelboard-input-group">
          <label htmlFor="centisecond">Decimals: </label>
          <input 
            id="centisecond"
            className="levelboard-submit-record"
            type="number"
            min="0"
            max="99"
            step="1"
            value={ form.values.centisecond }
            onChange={ (e) => handleChange(e) }
          />

          { /* If the error.centisecond field is defined, render that underneath the centisecond field. */ }
          { form.error.centisecond && <p>{ form.error.centisecond }</p> }

        </div>
      }
    </>

  );
  
};

/* ===== EXPORTS ===== */
export default RecordInput;