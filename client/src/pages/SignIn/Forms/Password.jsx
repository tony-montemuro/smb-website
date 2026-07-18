/* ===== IMPORTS ===== */
import AuthLogic from "./Auth.js";
import TextField from "@mui/material/TextField";

function Password({ password, handlePasswordChange, mode, isError }) {
  /* ===== VARIABLES ===== */
  const { MODE_SIGNIN, MODE_FORGOT_PASSWORD } = AuthLogic();
  const MIN_PASSWORD_LENGTH = 10;

  /* ===== PASSWORD COMPONENT ===== */
  return mode !== MODE_FORGOT_PASSWORD && (
    <TextField
      autoComplete={ mode === MODE_SIGNIN ? "current-password" : "new-password" }
      color={ isError ? "error" : "primary" }
      error={ isError }
      fullWidth
      id="password"
      inputProps={ { minLength: MIN_PASSWORD_LENGTH } }
      label="Password"
      name="password"
      placeholder="Your password"
      onChange={ handlePasswordChange }
      required
      type="password"
      value={ password }
      variant="filled"
    />
  )
}

/* ===== PASSWORD ====== */
export default Password;
