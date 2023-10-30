/* ===== IMPORTS ===== */
import { red } from "@mui/material/colors";
import styles from "./CloseButton.module.css";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

function CloseButton({ onClose, disableClose }) {
  /* ===== CLOSE BUTTON COMPONENT ===== */
  return (
    <button
      type="button"
      id={ disableClose ? styles.disabled : null }
      className={ styles.close }
      onClick={ onClose }
      disabled={ disableClose }
      title="Close"
    >
      <CloseRoundedIcon fontSize="large" sx={ { color: red[500] } } />
    </button>
  );
};

/* ===== EXPORTS ===== */
export default CloseButton;