/* ===== IMPORTS ===== */
import Approve from "./Approve";
import Insert from "./Insert";
import Delete from "./Delete";
import Popup from "../../components/Popup/Popup.jsx";
import Report from "./Report";
import Update from "./Update";

function NotificationPopup({ renderNotif, setRenderNotif, notification }) {
  /* ===== VARIABLES ===== */
  const notifType = notification ? notification.notif_type : null;
  let popupContent = null;
  switch (notifType) {
    case "approve":
      popupContent = <Approve notification={ notification } />;
      break;
    case "delete":
      popupContent = <Delete notification={ notification } />;
      break;
    case "insert":
      popupContent = <Insert notification={ notification } />;
      break;
    case "report":
      popupContent = <Report notification={ notification } />;
      break;
    case "update":
      popupContent = <Update notification={ notification } />;
      break;
    default:
      return null;
  };

  /* ===== NOTIFICATION POPUP COMPONENT ===== */
  return (
    <Popup renderPopup={ renderNotif } setRenderPopup={ setRenderNotif } width={ "33%" }>
      { popupContent }
    </Popup>
  );
};

/* ===== EXPORTS ===== */
export default NotificationPopup;