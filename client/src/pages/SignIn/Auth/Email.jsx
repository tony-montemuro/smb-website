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
      label="Email"
      name="email"
      placeholder="Your email address"
      onChange={ handleEmailChange }
      required
      type="email"
      value={ email }
      variant="filled"
      slotProps={{
        htmlInput: {
          inputMode: 'email',
          autoCapitalize: 'off',
          autoCorrect: 'off',
          spellCheck: false
        }
      }}
    />
  );
}

/* ===== EXPORTS ===== */
export default Email;
