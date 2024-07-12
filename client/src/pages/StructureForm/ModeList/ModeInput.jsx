/* ===== IMPORTS ===== */
import TextField from "@mui/material/TextField";

function ModeInput({ mode, category, handleChange }) {
  return (
    <TextField
      id={ `mode_${ category }${ mode && mode.id }` }
      label="Mode"
      onChange={ e => handleChange(e.target.value, category, mode?.id) }
      value={ mode?.name }
      variant="filled"
    />
  );
};

/* ===== EXPORTS ===== */
export default ModeInput;