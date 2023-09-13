/* ===== IMPORTS ===== */
import Username from "../../components/Username/Username";

function NotificationMessage({ message, notification }) {
  /* ===== NOTIFICATION MESSAGE COMPONENT ===== */
  // this component will only render if message exists
  return message && 
    <>
      { /* Message header */ }
      <h2>
        <Username profile={ notification.creator } />
        &nbsp;also left a message:
      </h2>

      { /* Render the message in quotations */ }
      <p>"{ notification.message }"</p>

    </>
};

/* ===== EXPORTS ===== */
export default NotificationMessage;