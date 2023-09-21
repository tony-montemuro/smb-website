/* ===== IMPORTS ===== */
import "./MessagePopup.css";
import { useEffect } from "react";
import FrontendHelper from "../../helper/FrontendHelper";

function MessagePopup({ message, onClose }) {
  /* ===== VARIABLES ===== */
  const typeStyle = {
    backgroundColor: message.type === "success" ? "rgba(76, 175, 80, 0.85)" : "rgba(244, 67, 54, 0.85)",
  };

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component first mounts
  useEffect(() => {
    let timer;

    // if message is of type success, auto close it after 5 seconds
    if (message.type === "success") {
      timer = setTimeout(() => onClose(), 5000);
    }

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  /* ===== MESSAGE POPUP COMPONENT ===== */
  return message.val &&
    <div className="message-popup" style={ typeStyle }>
      <div className="message-popup-content">
        <span>{ capitalize(message.type) }: { message.val }</span>
        <button type="button" className="message-popup-close" onClick={ () => onClose() }>
          Close
        </button>
      </div>
    </div>
};

/* ===== EXPORTS ===== */
export default MessagePopup;