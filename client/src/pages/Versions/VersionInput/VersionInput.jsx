/* ===== IMPORTS ===== */
import styles from "./VersionInput.module.css";
import TextField from "@mui/material/TextField";
import VersionInputLogic from "./VersionInput.js";

function VersionInput({ versions, currentVersion = undefined, updateVersions = undefined, sequence = undefined, addBtnSubmit = undefined }) {
  /* ===== VARIABLES ===== */
  const VERSION_LENGTH_MAX = 10;
  const key = sequence ? `version_${ sequence }` : "version";

  /* ===== STATES & FUNCTIONS ===== */
  const { version, onChange, onBlur, onSubmit } = VersionInputLogic(versions, currentVersion, updateVersions, addBtnSubmit, sequence);

  /* ===== VERSIONS INPUT ===== */
  return (
    <>
      <TextField
        autoComplete="off"
        color={ version.error ? "error" : "primary" }
        error={ version.error ? true : false }
        className={ styles.input }
        helperText={ version.error ?? `${ version.value.length }/${ VERSION_LENGTH_MAX }` }
        id={ key }
        key={ key }
        inputProps={ { maxLength: VERSION_LENGTH_MAX } }
        label="Version"
        onBlur={ onBlur }
        onChange={ onChange }
        placeholder={ `Must be ${ VERSION_LENGTH_MAX } characters or less` }
        required
        value={ version.value }
        variant="filled"
      />

      { addBtnSubmit &&
        <button type="button" onClick={ onSubmit }>Add Version</button>
      }
    </>
  );
};

/* ===== EXPORTS ===== */
export default VersionInput;