/* ===== IMPORTS ===== */
import Action from "./Action.jsx";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

function Message({ toastContent, handleClose }) {
  /* ===== VARIABLES ===== */
  const message = toastContent.message;
  const open = toastContent.open;
  const severity = toastContent.severity;
  const timer = toastContent.timer;

  /* ===== TOAST COMPONENT ===== */
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