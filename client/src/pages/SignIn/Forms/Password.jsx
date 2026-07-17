/* ===== IMPORTS ===== */
import AuthLogic from "./Auth.js";
import TextField from "@mui/material/TextField";

function Password({ password, handlePasswordChange, mode, errorMsg }) {
  /* ===== VARIABLES ===== */
  const { MODE_SIGNIN, MODE_FORGOT_PASSWORD } = AuthLogic();

  /* ===== PASSWORD COMPONENT ===== */
  return mode !== MODE_FORGOT_PASSWORD && (
    <TextField
      autoComplete={ mode === MODE_SIGNIN ? "current-password" : "password" }
      color={ errorMsg ? "error" : "primary" }
      error={ errorMsg ? true : false }
      fullWidth
      id="password"
      label="Password"
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
