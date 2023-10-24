/* ===== IMPORTS ===== */
import { PopupContext } from "../../../utils/Contexts";
import { useContext } from "react";
import styles from "./Popups.module.css";
import CheckmarkOrX from "./CheckmarkOrX";
import FrontendHelper from "../../../helper/FrontendHelper";
import NotificationBasicInfo from "./NotificationBasicInfo";
import NotificationProof from "./NotificationProof";
import Username from "../../../components/Username/Username.jsx";

function Insert() {
  /* ===== CONTEXTS ===== */
  
  // popup data state from popup context
  const { popupData } = useContext(PopupContext);

  /* ===== VARIABLES ===== */
  const notification = popupData;
  const submission = notification.submission;
  const type = notification.score ? "score" : "time";

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, dateB2F, recordB2F } = FrontendHelper();

  /* ===== INSERT COMPONENT ===== */
  return (
    <>

      { /* Popup header - includes a link to the moderator's user page */ }
      <h2>
        <Username profile={ notification.creator } />
        &nbsp;has submitted the following submission on your behalf: 
      </h2>

      { /* Notification details - render the basic info, as well as more specific information that the moderator inserted */ }
      <div className={ styles.detailsWrapper }>
        <div className={ styles.details }>
          <ul>
            <NotificationBasicInfo notification={ notification } />
            <li>
              { capitalize(type) }: { recordB2F(notification.record, type, notification.level.timer_type) }
            </li>
            <li>Date: { dateB2F(submission.submitted_at) }</li>
            <li>Monkey: { submission.monkey.monkey_name }</li>
            <li>Platform: { submission.platform.platform_name }</li>
            <li>Region: { submission.region.region_name }</li>
            <li><NotificationProof proof={ submission.proof } /></li>
            <li>Live Proof: <CheckmarkOrX isChecked={ submission.live } /></li>
            <li>TAS: <CheckmarkOrX isChecked={ submission.tas } /></li>
          </ul>
        </div>
      </div>

    </>
  );
};

/* ===== EXPORTS ===== */
export default Insert;