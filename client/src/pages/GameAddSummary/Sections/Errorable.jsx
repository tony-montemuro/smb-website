/* ===== IMPORTS ===== */
import styles from "./Sections.module.css";
import FormHelperText from "@mui/material/FormHelperText";

function Errorable({ error, renderMessage = false, children }) {
  /* ===== ERRORABLE COMPONENT ===== */
  return (
    <>
      <div className={ error && styles.errorable }>
        { children }
        { error && renderMessage && <FormHelperText error>{ error }</FormHelperText> }
      </div>
    </>
  );
};

/* ===== EXPORTS ===== */
export default Errorable;