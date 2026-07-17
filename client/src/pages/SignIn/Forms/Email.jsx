import TextField from "@mui/material/TextField";

function Email({ email, handleEmailChange, errorMsg }) {

  /* ===== EMAIL COMPONENT ===== */
  return (
    <TextField
      autoComplete="email"
      color={ errorMsg ? "error" : "primary" }
      error={ errorMsg ? true : false }
      fullWidth
      id="email"
      helperText={ errorMsg }
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
