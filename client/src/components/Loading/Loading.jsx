/* ===== IMPORTS ===== */
import CircularProgress from "@mui/material/CircularProgress";

function Loading() {
  /* ===== LOADING COMPONENT ===== */
  return (
    <div className="center" style={ { padding: "10px" } }>
      <CircularProgress />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Loading;