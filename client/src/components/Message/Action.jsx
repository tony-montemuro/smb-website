/* ===== IMPORTS ===== */
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

function Action({ handleClose }) {
  return (
    <>
      <IconButton
        aria-label="close"
        onClick={ handleClose }
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );
};

/* ===== EXPORTS ===== */
export default Action;