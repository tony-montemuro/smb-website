/* ===== IMPORTS ===== */
import "./MessagePopup.css";
import FrontendHelper from "../../helper/FrontendHelper";

function MessagePopup({ message, type, index, onClose }) {
  /* ===== VARIABLES ===== */
  const typeStyle = {
    backgroundColor: type === "success" ? "rgba(76, 175, 80, 0.85)" : "rgba(244, 67, 54, 0.85)",
    top: `${ 9 + index * 5 }vh`
  };

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== MESSAGE POPUP COMPONENT ===== */
  return (
    <div className="message-popup" style={ typeStyle }>
      <div className="message-popup-content">
        <span>{ capitalize(type) }: { message }</span>
        <button className="message-popup-close" onClick={ () => onClose(index) }>
          Close
        </button>
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default MessagePopup;