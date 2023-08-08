/* ===== IMPORTS ===== */
import CheckIcon from "@mui/icons-material/Check";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

function ActionSymbol({ action }) {
  /* ===== ACTION SYMBOL COMPONENT ===== */
  switch (action) {
    case "approve":
      return (
        <div className="submission-handler-action-symbol">
          <CheckIcon titleAccess="Approve" />
        </div>
      );
    case "delete":
      return (
        <div className="submission-handler-action-symbol">
          <DeleteRoundedIcon titleAccess="Reject" />
        </div>
      );
    case "update":
      return (
        <div className="submission-handler-action-symbol" title="Update & Approve">
          <EditRoundedIcon /> <b>+</b> <CheckIcon />
        </div>
      );
    default:
      return null;
  };
};

/* ===== EXPORTS ===== */
export default ActionSymbol;