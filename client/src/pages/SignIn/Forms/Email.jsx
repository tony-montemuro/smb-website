/* ===== IMPORTS ===== */
import TextField from "@mui/material/TextField";

function Email({ email, handleEmailChange, isError }) {
  /* ===== EMAIL COMPONENT ===== */
  return (
    <TextField
      autoComplete="username"
      color={ isError ? "error" : "primary" }
      error={ isError }
      fullWidth
      id="email"
      inputProps={ {
        inputMode: 'email',
        autoCapitalize: 'off',
        autoCorrect: 'off',
        spellCheck: false
      } }
      label="Email"
      name="email"
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
