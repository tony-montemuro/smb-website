/* ===== IMPORTS ===== */
import "./Notifications.css";
import ApprovePopup from "./ApprovePopup";
import InsertPopup from "./InsertPopup";
import DeletePopup from "./DeletePopup";
import ReportPopup from "./ReportPopup";

function NotificationPopup({ notifications, setNotifications }) {
  /* ===== VARIABLES ===== */
  const notification = notifications.current;

  /* ===== NOTIFICATION POPUP COMPONENT ===== */
  if (notification) {
    switch (notification.notif_type) {
      case "approve":
        return <ApprovePopup notifications={ notifications } setNotifications={ setNotifications } />;
      case "insert":
        return <InsertPopup notifications={ notifications } setNotifications={ setNotifications } />;
      case "delete":
        return <DeletePopup notifications={ notifications } setNotifications={ setNotifications } />;
      case "report":
        return <ReportPopup notifications={ notifications } setNotifications={ setNotifications } />;
      default:
        return null;
    }
  } else {
    return null;
  }
};

/* ===== EXPORTS ===== */
export default NotificationPopup;