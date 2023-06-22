/* ===== IMPORTS ===== */
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";

function LiveSymbol({ liveStatus }) {
  /* ===== LIVE SYMBOL COMPONENT ===== */
  return liveStatus ?
    <CheckIcon />
  :
    <ClearIcon />
};

/* ===== EXPORTS ===== */
export default LiveSymbol;