/* ===== IMPORTS ===== */
import AuthLogic from "./Auth.js";
import TextField from "@mui/material/TextField";

function Password({ form, handleChange, mode, error }) {
  /* ===== VARIABLES ===== */
  const { MODE_SIGNIN, MODE_SIGNUP, MODE_FORGOT_PASSWORD } = AuthLogic();
  const MIN_PASSWORD_LENGTH = 10;

  /* ===== PASSWORD COMPONENT ===== */
  return mode !== MODE_FORGOT_PASSWORD && (
    <>
      <TextField
        autoComplete={ mode === MODE_SIGNIN ? "current-password" : "new-password" }
        color={ error.password ? "error" : "primary" }
        error={ error.password }
        fullWidth
        id="password"
        inputProps={ { minLength: MIN_PASSWORD_LENGTH } }
        label="Password"
        name="password"
        placeholder="Your password"
        onChange={ handleChange }
        required
        type="password"
        value={ form.password }
        variant="filled"
      />
      {
        mode === MODE_SIGNUP && <TextField
          autoComplete="new-password"
          color={ error.confirmPassword ? "error" : "primary" }
          error={ error.confirmPassword }
          fullWidth
          id="confirm-passowrd"
          inputProps={ { minLength: MIN_PASSWORD_LENGTH } }
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Your password"
          onChange={ handleChange }
          required
          type="password"
          value={ form.confirmPassword }
          variant="filled"
        />
      }
    </>
  )
}

/* ===== PASSWORD ====== */
export default Password;
