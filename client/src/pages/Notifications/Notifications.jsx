/* ===== IMPORTS ===== */
import "./Notifications.css";
import { useContext, useEffect } from "react";
import { UserContext } from "../../Contexts";
import NotificationsLogic from "./Notifications.js";
import NotificationPopup from "./NotificationPopup";
import NotificationTableRow from "./NotificationTableRow";

function Notifications() {
  /* ===== VARIABLES ===== */
  const TABLE_WIDTH = 7;

  /* ===== CONTEXTS ===== */
  
  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== FUNCTIONS ===== */

  // states and functions from init file
  const { 
    notifications, 
    init, 
    setNotifications,
    toggleSelection,
    toggleSelectionAll,
    removeSelected
  } = NotificationsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the page first loads
  useEffect(() => {
    if (user.notifications) {
      init(user.notifications)
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ===== NOTIFICATION COMPONENT ===== */
  return notifications.all ?
    <>
      { /* Notifications header */ }
      <div className="notifications-header">
        <div className="notifications-header-info">

          { /* Render name of the page, and a message introducing the page. */ }
          <h1>Notifications</h1>
          <p><i>Below is the list of all your notifications. There are 4 types of notifications:</i></p>
        </div>

        { /* Notification type list - render a list element describing each notification type. */ }
        <ol>
          <li><b>Approvals:</b> A moderator has approved of your submission.</li>
          <li><b>Inserts:</b> A moderator has submitted a submission on your behalf.</li>
          <li><b>Deletes:</b> A moderator has deleted your submission.</li>
          <li><b>Report:</b> A user has reported { user.is_mod ? "a submission." : "one of your submissions." }</li>
        </ol>
      </div>

      { /* Notification body */ }
      <div className="notifications-body">

        { /* Delete button - when pressed, will remove all notifications the user has selected. This button
        is disabled if no notifications are selected. */ }
        <button onClick={ removeSelected } disabled={ notifications.selected.length === 0 }>Delete</button>

        { /* Notification table */ }
        <table>

          { /* Table header - render information about what is contained in each row */ }
          <thead>
            <tr>

              { /* Select all toggle - a checkbox the user can select to either select/unselect all notifications */ }
              <th>
                <input
                  type="checkbox"
                  checked={ notifications.all.length > 0 && notifications.selected.length === notifications.all.length }
                  disabled={ notifications.all.length === 0 }
                  onChange={ toggleSelectionAll }
                />
              </th>

              <th>Details</th>
              <th>Type</th>
              <th>Game</th>
              <th>Level</th>
              <th>Record</th>
              <th>Notification Date</th>
            </tr>
          </thead>

          { /* Table body - render a row for each notification */ }
          <tbody>

            { /* If there are notifications, map a NotificationTableRow element for each notification */ }
            { notifications.all.length > 0 ?
              notifications.all.map(row => {
                return <NotificationTableRow 
                  row={ row } 
                  notifications= { notifications } 
                  setNotifications={ setNotifications } 
                  toggleSelection={ toggleSelection } 
                  key={ row.notif_date }
                />;
              })
            :
            
              // Otherwise, render a single row that informs the user they have no notifications
              <tr>
                <td colSpan={ TABLE_WIDTH }>
                  <i>You have no notifications!</i>
                </td>
              </tr>
            }

          </tbody>

        </table> 
      </div>

      { /* Notification popup element - will only render if the current field in the notification state is set */ }
      <NotificationPopup notifications={ notifications } setNotifications={ setNotifications } />
    </>
  :

    // Loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default Notifications;