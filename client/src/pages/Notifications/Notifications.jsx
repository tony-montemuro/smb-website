/* ===== IMPORTS ===== */
import "./Notifications.css";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { MessageContext, UserContext } from "../../utils/Contexts";
import NotificationsLogic from "./Notifications.js";
import NotificationPopup from "./NotificationPopup";
import NotificationTableRow from "./NotificationTableRow";
import TypeSymbol from "./TypeSymbol";

function Notifications() {
  /* ===== CONTEXTS ===== */
  
  // user state from user context
  const { user } = useContext(UserContext);

  // addMessage function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== VARIABLES ===== */
  const TABLE_WIDTH = 7;
  const messages = {
    approve: "A moderator has approved one of your submission.",
    report: "A user has reported one of your submissions.",
    insert: "A moderator has inserted a new submission on your behalf.",
    update: "A moderator has updated one of you submissions.",
    delete: "A moderator has deleted one of your submissions."
  };
  const navigate = useNavigate();

  /* ===== FUNCTIONS ===== */

  // states and functions from init file
  const { 
    notifications, 
    init, 
    setNotifications,
    toggleSelection,
    toggleSelectionAll,
    removeSelected,
    handleRowClick
  } = NotificationsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the page first loads
  useEffect(() => {
    if (user.id !== undefined) {
      // if not user.id (meaning user is null), current user is not authenticated. thus, deny
      // access to this page.
      if (!user.id) {
        addMessage("You cannot access this page.", "error");
        navigate("/");
        return;
      }

      // if we made it past this check, we can go ahead and initialize the page
      init(user.notifications);
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
        </div>

        { /* Notification type list - render a list element describing each notification type. */ }
        <div className="notifications-header-list">
          <ul>
            { Object.keys(messages).map(type => {
              return (
                <li key={ type }>
                  <div className="notifications-header-list-element">
                    <TypeSymbol type={ type } />&emsp;
                    <span>{ messages[type] }</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

      </div>

      { /* Notification body */ }
      <div className="notifications-body">

        { /* Delete button - when pressed, will remove all notifications the user has selected. This button
        is disabled if no notifications are selected. */ }
        <button type="button" onClick={ removeSelected } disabled={ notifications.selected.length === 0 || notifications.submitting }>
          Delete
        </button>

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

              <th>Type</th>
              <th>Time Ago</th>
              <th>Game</th>
              <th>Category</th>
              <th>Level</th>
              <th>Record</th>
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
                  handleRowClick={ handleRowClick } 
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