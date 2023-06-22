/* ===== IMPORTS ===== */
import ClearIcon from "@mui/icons-material/Clear";
import VideocamIcon from '@mui/icons-material/Videocam';

function NotificationProof({ proof }) {
  /* ===== NOTIFICATION PROOF COMPONENT ===== */
  return (
    <>
      Proof:&nbsp;

      { /* If the proof exists, create a link to it. */ }
      { proof ?
        <a href={ proof } target="_blank" rel="noopener noreferrer">
          <VideocamIcon sx={{ color: "black" }} />
        </a>
      :
      
        // Otherwise, just render a clear icon
        <ClearIcon />
      }
    </>
  );
};

/* ===== EXPORTS ===== */
export default NotificationProof;