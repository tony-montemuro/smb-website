/* ===== IMPORTS ===== */
import TextField from "@mui/material/TextField";

function ModeInput({ mode, category, id }) {
  return (
    <TextField
      id={ `mode_${ category }${ id }` }
      label="Mode"
      onChange={ () => {} }
      value={ mode }
      variant="filled"
    />
  );
};

/* ===== EXPORTS ===== */
export default ModeInput;