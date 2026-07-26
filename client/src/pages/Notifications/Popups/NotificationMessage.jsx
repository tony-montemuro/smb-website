/* ===== IMPORTS ===== */
import Username from "../../../components/Username/Username";

function NotificationMessage({ message, notification }) {
  /* ===== NOTIFICATION MESSAGE COMPONENT ===== */
  return (
    message && (
      <>
        <h2>
          <Username profile={notification.creator} />
          &nbsp;also left a message:
        </h2>
        <p>&quot;{notification.message}&quot;</p>
      </>
    )
  );
}

/* ===== EXPORTS ===== */
export default NotificationMessage;
