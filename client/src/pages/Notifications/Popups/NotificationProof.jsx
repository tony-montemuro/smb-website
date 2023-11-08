/* ===== IMPORTS ===== */
import ClearIcon from "@mui/icons-material/Clear";
import VideocamIcon from "@mui/icons-material/Videocam";

function NotificationProof({ proof }) {
  /* ===== NOTIFICATION PROOF COMPONENT ===== */
  return (
    <>
      Proof:&nbsp;
      { proof ?
        <a href={ proof } target="_blank" rel="noopener noreferrer">
          <VideocamIcon sx={{ color: "white" }} titleAccess={ proof } />
        </a>
      :
        <ClearIcon />
      }
    </>
  );
};

/* ===== EXPORTS ===== */
export default NotificationProof;