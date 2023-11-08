/* ===== IMPORTS ===== */
import { PopupContext } from "../../../utils/Contexts";
import { useContext } from "react";
import styles from "./Popups.module.css";
import CheckmarkOrX from "./CheckmarkOrX";
import FrontendHelper from "../../../helper/FrontendHelper";
import NotificationBasicInfo from "./NotificationBasicInfo";
import Username from "../../../components/Username/Username.jsx";

function Approve() {
  /* ===== CONTEXTS ===== */

  // popup data state from popup context
  const { popupData } = useContext(PopupContext);

  /* ===== VARIABLES ===== */
  const notification = popupData;
  const type = notification.score ? "score" : "time";

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, recordB2F } = FrontendHelper()

  /* ===== APPROVE COMPONENT ===== */
  return (
    <div className={ styles.popup }>
    
      { /* Popup header - includes a link to the moderator's user page */ }
      <h2>
        <Username profile={ notification.creator } />
        &nbsp;has approved the following submission: 
      </h2>

      { /* Notification details - render the basic info, record, and tas status */ }
      <div className={ styles.details }>
        <ul>
          <NotificationBasicInfo notification={ notification } />
          <li>
            { capitalize(type) }: { recordB2F(notification.record, type, notification.level.timer_type) }
          </li>
          <li>TAS: <CheckmarkOrX isChecked={ notification.tas } /></li>
        </ul>
      </div>
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Approve;