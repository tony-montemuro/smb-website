/* ===== IMPORTS ===== */
import TextField from "@mui/material/TextField";

function RecordInput({ form, handleChange, timerType, type }) {
  /* ===== RECORD INPUT COMPONENT ===== */

  // If type is score, we simply render an input that allows user to enter a number.
  if (type === "score") {
    return (
      <TextField
        fullWidth
        helperText={ form.error.record ? form.error.record : null }
        id="record"
        inputProps={ { 
          inputMode: "numeric",
          pattern: "[0-9]*",
        } }
        label="Score"
        onChange={ handleChange }
        placeholder="Do not include commas"
        required
        value={ form.values.record }
        variant="filled"
      />
    );
  }

  // Otherwise, we render an input for each possible time according to the timer type
  return (
    <>
      { timerType.includes("hour") &&
        <TextField
          color={ form.error.hour ? "error" : "primary" }
          fullWidth
          helperText={ form.error.hour ? form.error.hour : null }
          id="hour"
          inputProps={ { 
            inputMode: "numeric",
            pattern: "[0-9]*",
          } }
          label="Hours"
          onChange={ handleChange }
          value={ form.values.hour }
          variant="filled"
        />
      }
      { timerType.includes("min") &&
        <TextField
          color={ form.error.minute ? "error" : "primary" }
          fullWidth
          helperText={ form.error.minute ? form.error.minute : null }
          id="minute"
          inputProps={ { 
            inputMode: "numeric",
            pattern: "[0-9]*",
          } }
          label="Minutes"
          onChange={ handleChange }
          value={ form.values.minute }
          variant="filled"
        />
      }
      { timerType.includes("sec") &&
        <TextField
          color={ form.error.second ? "error" : "primary" }
          fullWidth
          helperText={ form.error.second ? form.error.second : null }
          id="second"
          inputProps={ { 
            inputMode: "numeric",
            pattern: "[0-9]*",
          } }
          label="Seconds"
          onChange={ handleChange }
          value={ form.values.second }
          variant="filled"
        />
      }
      { timerType.includes("csec") &&
        <TextField
          color={ form.error.centisecond ? "error" : "primary" }
          fullWidth
          helperText={ form.error.centisecond ? form.error.centisecond : null }
          id="centisecond"
          inputProps={ { 
            inputMode: "numeric",
            pattern: "[0-9]*",
          } }
          label="Decimals"
          onChange={ handleChange }
          value={ form.values.centisecond }
          variant="filled"
        />
      }
    </>
  );
  
};

/* ===== EXPORTS ===== */
export default RecordInput;