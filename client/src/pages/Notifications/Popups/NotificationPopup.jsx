/* ===== IMPORTS ===== */
import Approve from "./Approve";
import Insert from "./Insert";
import Delete from "./Delete";
import Popup from "../../../components/Popup/Popup.jsx";
import Report from "./Report";
import Update from "./Update";

function NotificationPopup({ notification, setNotification }) {
  /* ===== FUNCTIONS ===== */
  
  // FUNCTION 1: getPopupContent - code that returns the proper popup content to render according to the notification
  const getPopupContent = notification => {
    const notifType = notification ? notification.notif_type : null;
    switch (notifType) {
      case "approve": return <Approve />;
      case "delete": return <Delete />;
      case "insert": return <Insert />;
      case "report": return <Report />;
      case "update": return <Update />;
      default: return null;
    };
  };

  /* ===== NOTIFICATION POPUP COMPONENT ===== */
  return (
    <Popup renderPopup={ notification } setRenderPopup={ setNotification } width="500px">
      { getPopupContent(notification) }
    </Popup>
  );
};

/* ===== EXPORTS ===== */
export default NotificationPopup;