/* ===== IMPORTS ===== */
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FiberNewOutlinedIcon from "@mui/icons-material/FiberNewOutlined";
import FrontendHelper from "../../helper/FrontendHelper";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";

function TypeSymbol({ type }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== TYPE SYMBOL COMPONENT ===== */
  switch(type) {
    case "approve": 
      return <CheckOutlinedIcon titleAccess={ capitalize(type) } />;
    case "insert":
      return <FiberNewOutlinedIcon titleAccess={ capitalize(type) } />;
    case "update":
      return <EditRoundedIcon titleAccess={ capitalize(type) } />;
    case "delete":
      return <DeleteOutlineOutlinedIcon titleAccess={ capitalize(type) } />;
    case "report":
      return <ReportGmailerrorredIcon titleAccess={ capitalize(type) } />;
    default:
      return null;
  };
};

/* ===== EXPORTS ===== */
export default TypeSymbol;