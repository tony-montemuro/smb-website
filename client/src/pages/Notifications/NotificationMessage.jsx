/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";

function NotificationMessage({ message, notification }) {
  /* ===== NOTIFICATION MESSAGE COMPONENT ===== */
  // this component will only render if message exists
  return message && 
    <>
      { /* Message header */ }
      <h2>
        <Link to={`/user/${ notification.creator.id }`}>{ notification.creator.username }</Link> also left a message:
      </h2>

      { /* Render the message in quotations */ }
      <p>"{ notification.message }"</p>

    </>
};

/* ===== EXPORTS ===== */
export default NotificationMessage;