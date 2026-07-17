/* ===== IMPORTS ===== */
import TextField from "@mui/material/TextField";

function Email({ email, handleEmailChange, isError }) {
  /* ===== EMAIL COMPONENT ===== */
  return (
    <TextField
      autoComplete="email"
      color={ isError ? "error" : "primary" }
      error={ isError }
      fullWidth
      id="email"
      label="Email"
      placeholder="Your email address"
      onChange={ handleEmailChange }
      required
      type="email"
      value={ email }
      variant="filled"
    />
  );
}

/* ===== EXPORTS ===== */
export default Email;
