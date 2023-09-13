/* ===== IMPORTS ===== */
import "./Notifications.css";
import ApprovePopup from "./ApprovePopup";
import InsertPopup from "./InsertPopup";
import DeletePopup from "./DeletePopup";
import ReportPopup from "./ReportPopup";
import UpdatePopup from "./UpdatePopup";

function NotificationPopup({ notifications, dispatchNotifications }) {
  /* ===== VARIABLES ===== */
  const notification = notifications.current;

  /* ===== NOTIFICATION POPUP COMPONENT ===== */
  if (notification) {
    switch (notification.notif_type) {
      case "approve":
        return <ApprovePopup notifications={ notifications } dispatchNotifications={ dispatchNotifications } />;
      case "insert":
        return <InsertPopup notifications={ notifications } dispatchNotifications={ dispatchNotifications } />;
      case "delete":
        return <DeletePopup notifications={ notifications } dispatchNotifications={ dispatchNotifications } />;
      case "report":
        return <ReportPopup notifications={ notifications } dispatchNotifications={ dispatchNotifications } />;
      case "update":
        return <UpdatePopup notifications={ notifications } dispatchNotifications={ dispatchNotifications } />;
      default:
        return null;
    }
  } else {
    return null;
  }
};

/* ===== EXPORTS ===== */
export default NotificationPopup;