/* ===== IMPORTS ===== */
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";

function CheckmarkOrX({ isChecked }) {
  /* ===== LIVE SYMBOL COMPONENT ===== */
  return isChecked ? <CheckIcon /> : <ClearIcon />;
};

/* ===== EXPORTS ===== */
export default CheckmarkOrX;