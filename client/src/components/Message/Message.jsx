/* ===== IMPORTS ===== */
import Action from "./Action.jsx";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

function Message({ messageContent, handleClose }) {
  /* ===== VARIABLES ===== */
  const message = messageContent.message;
  const open = messageContent.open;
  const severity = messageContent.severity;
  const timer = messageContent.timer;

  /* ===== MESSAGE COMPONENT ===== */
  return (
    <Snackbar 
      action={ <Action handleClose={ handleClose } /> }
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      autoHideDuration={ timer }
      message={ message }
      onClose={ handleClose }
      open={ open }
    >
      <Alert
        onClose={ handleClose }
        severity={ severity }
        sx={{ width: "100%" }}
        variant="filled"
      >
        { message }
      </Alert>
    </Snackbar>
  );
};

/* ===== EXPORTS ===== */
export default Message;