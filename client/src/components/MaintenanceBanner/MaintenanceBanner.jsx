/* ===== IMPORTS ===== */
import { MAINTENANCE_MESSAGE } from "../../utils/Maintenance";
import Alert from "@mui/material/Alert";

function MaintenanceBanner() {
  /* ===== MAINTENANCE BANNER COMPONENT ===== */
  if (!MAINTENANCE_MESSAGE) {
    return null;
  }

  return (
    <Alert severity="warning" sx={{ borderRadius: 0 }} variant="filled">
      {MAINTENANCE_MESSAGE}
    </Alert>
  );
}

/* ===== EXPORTS ===== */
export default MaintenanceBanner;
