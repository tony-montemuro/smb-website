/* ===== IMPORTS ===== */
import { PopupContext } from "../../utils/Contexts";
import { useContext } from "react";
import CheckmarkOrX from "./CheckmarkOrX";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationBasicInfo from "./NotificationBasicInfo";
import NotificationMessage from "./NotificationMessage";
import Username from "../../components/Username/Username";

function Delete() {
  /* ===== CONTEXTS ===== */
  
  // popup data from popup context
  const { popupData } = useContext(PopupContext);

  /* ===== VARIABLES ===== */
  const notification = popupData;
  const type = notification.score ? "score" : "time";

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, recordB2F } = FrontendHelper();

  /* ===== DELETE COMPONENT ===== */
  return (
    <div className="notifications-delete">

      { /* Popup header - includes a link to the moderator's user page */ }
      <h2>
        <Username profile={ notification.creator } />
        &nbsp;has removed the following submission: 
      </h2>

      { /* Notification details */ }
      <div className="notifications-details-wrapper">
        <div className="notifications-details">
          <ul>

            { /* Render basic information about submission - includes the game, as well as level */ }
            <NotificationBasicInfo notification={ notification } />

            { /* Render the record */ }
            <li>
              { capitalize(type) }: { recordB2F(notification.record, type, notification.level.timer_type) }
            </li>

            { /* Render whether or not the submission used TAS */ }
            <li>TAS: <CheckmarkOrX isChecked={ notification.tas } /></li>

          </ul>
        </div>
      </div>

      { /* Render the message associated with the submission, if there is one. */ }
      <NotificationMessage message={ notification.message } notification={ notification } />

    </div>
  );
};

/* ===== EXPORTS ===== */
export default Delete;