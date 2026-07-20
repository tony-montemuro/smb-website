/* ===== IMPORTS ===== */
import TextField from "@mui/material/TextField";

function RecordInput({ form, handleChange, timerType, type }) {
  /* ===== RECORD INPUT COMPONENT ===== */

  // If type is score, we simply render an input that allows user to enter a number.
  if (type === "score") {
    return (
      <TextField
        autoComplete="off"
        fullWidth
        helperText={ form.error.record ? form.error.record : null }
        id="record"
        label="Score"
        onChange={ handleChange }
        placeholder="Do not include commas"
        required
        value={ form.values.record }
        variant="filled"
        slotProps={{
          htmlInput: { 
            inputMode: "numeric",
            pattern: "[0-9]*",
          }
        }}
      />
    );
  }

  // Otherwise, we render an input for each possible time according to the timer type
  return (
    <>
      { timerType.includes("hour") &&
        <TextField
          autoComplete="off"
          color={ form.error.hour ? "error" : "primary" }
          fullWidth
          helperText={ form.error.hour ? form.error.hour : null }
          id="hour"
          label="Hours"
          onChange={ handleChange }
          value={ form.values.hour }
          variant="filled"
          slotProps={{
            htmlInput: { 
              inputMode: "numeric",
              pattern: "[0-9]*",
            }
          }}
        />
      }
      { timerType.includes("min") &&
        <TextField
          autoComplete="off"
          color={ form.error.minute ? "error" : "primary" }
          fullWidth
          helperText={ form.error.minute ? form.error.minute : null }
          id="minute"
          label="Minutes"
          onChange={ handleChange }
          value={ form.values.minute }
          variant="filled"
          slotProps={{
            htmlInput: { 
              inputMode: "numeric",
              pattern: "[0-9]*",
            }
          }}
        />
      }
      { timerType.includes("sec") &&
        <TextField
          autoComplete="off"
          color={ form.error.second ? "error" : "primary" }
          fullWidth
          helperText={ form.error.second ? form.error.second : null }
          id="second"
          label="Seconds"
          onChange={ handleChange }
          value={ form.values.second }
          variant="filled"
          slotProps={{
            htmlInput: { 
              inputMode: "numeric",
              pattern: "[0-9]*",
            }
          }}
        />
      }
      { timerType.includes("csec") &&
        <TextField
          autoComplete="off"
          color={ form.error.centisecond ? "error" : "primary" }
          fullWidth
          helperText={ form.error.centisecond ? form.error.centisecond : null }
          id="centisecond"
          label="Decimals"
          onChange={ handleChange }
          value={ form.values.centisecond }
          variant="filled"
          slotProps={{
            htmlInput: { 
              inputMode: "numeric",
              pattern: "[0-9]*",
            }
          }}
        />
      }
      { timerType.includes("msec") &&
        <TextField
          autoComplete="off"
          color={ form.error.millisecond ? "error" : "primary" }
          fullWidth
          helperText={ form.error.millisecond ? form.error.millisecond : null }
          id="millisecond"
          label="Decimals"
          onChange={ handleChange }
          value={ form.values.millisecond }
          variant="filled"
          slotProps={{
            htmlInput: { 
              inputMode: "numeric",
              pattern: "[0-9]*",
            }
          }}
        />
      }
    </>
  );
  
};

/* ===== EXPORTS ===== */
export default RecordInput;