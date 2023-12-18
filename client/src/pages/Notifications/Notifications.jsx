/* ===== IMPORTS ===== */
import { CategoriesContext, MessageContext, UserContext } from "../../utils/Contexts";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import styles from "./Notifications.module.css";
import Container from "../../components/Container/Container.jsx";
import LoadingTable from "../../components/LoadingTable/LoadingTable";
import NotificationsLogic from "./Notifications.js";
import NotificationPopup from "./Popups/NotificationPopup";
import NotificationTableRow from "./NotificationTableRow/NotificationTableRow.jsx";
import PageControls from "../../components/PageControls/PageControls.jsx";
import TableContent from "../../components/TableContent/TableContent.jsx";
import TypeSymbol from "./TypeSymbol";

function Notifications() {
  /* ===== CONTEXTS ===== */

  // categories state from categories context
  const { categories } = useContext(CategoriesContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);
  
  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== VARIABLES ===== */
  const TABLE_WIDTH = 7;
  const NOTIFS_PER_PAGE = 50;
  const messages = {
    approve: "A moderator has approved one of your submissions.",
    report: "A user has reported one of your submissions.",
    insert: "A moderator has inserted a new submission on your behalf.",
    update: "A moderator has updated one of your submissions.",
    delete: "A moderator has deleted one of your submissions."
  };
  const navigateTo = useNavigate();

  /* ===== STATES & FUNCTIONS ===== */
  const [notification, setNotification] = useState(undefined);

  // states and functions from init file
  const { 
    notifications, 
    pageNum,
    updateNotifications,
    areAllNotifsSelected,
    getSelectedCount,
    toggleSelection,
    toggleSelectionAll, 
    removeSelected,
    changePage
  } = NotificationsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, when the user state updates, OR when the pageNum is updated
  useEffect(() => {
    if (user.id !== undefined) {
      // if not user.id (meaning user is null), current user is not authenticated. thus, deny
      // access to this page.
      if (!user.id) {
        addMessage("Forbidden access.", "error", 5000);
        navigateTo("/");
        return;
      }

      // if we made it past this check, we can go ahead and update the notifications state
      updateNotifications(NOTIFS_PER_PAGE, pageNum);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pageNum]);

  /* ===== NOTIFICATION COMPONENT ===== */
  return (
    <div className={ styles.notifications }>
      { /* Notification popup element */ }
      <NotificationPopup notification={ notification } setNotification={ setNotification } />

      { /* Notifications header - render the name of the page, as well as information for each notification type */ }
      <div className={ styles.header }>
        <h1>Notifications</h1>
        <Container>
          <ul>
            { Object.keys(messages).map(type => {
              return (
                <li key={ type }>
                  <div className={ styles.message }>
                    <TypeSymbol type={ type } />&emsp;
                    <span>{ messages[type] }</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Container>        
      </div>

      { /* Notifications body - render the list of notifications */ }
      <div className={ styles.body }>
        <div className={ styles.delete }>
          <button 
            type="button" 
            onClick={ removeSelected } 
            disabled={ !notifications.all || getSelectedCount() === 0 || notifications.submitting }
          >
            Delete
          </button>

          { /* Render message displaying how many notifications have been selected, if any */ }
          { getSelectedCount() > 0 && <span>{ getSelectedCount() } Selected</span> }
        </div>

        {/* Notification table - render a row for each notification the user has */}
        <div className="table">
          <table>

            { /* Table header - render information about what is contained in each row */ }
            <thead>
              <tr>

                { /* Select all toggle - a checkbox the user can select to either select/unselect all notifications */ }
                <th>
                  <input
                    type="checkbox"
                    checked={ notifications.all !== undefined && notifications.all.length > 0 && areAllNotifsSelected(pageNum) }
                    disabled={ !notifications.all || notifications.all.length === 0 }
                    onChange={ () => toggleSelectionAll(pageNum) }
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
              { notifications.all && categories ? 
                <TableContent items={ notifications.all } emptyMessage="You have no notifications!" numCols={ TABLE_WIDTH }>
                  { notifications.all.map(row => {
                    return <NotificationTableRow 
                      row={ row } 
                      notifications= { notifications } 
                      pageNum={ pageNum }
                      handleRowClick={ setNotification } 
                      toggleSelection={ toggleSelection } 
                      key={ row.notif_date }
                    />;
                  })}
                </TableContent>
              :
                <LoadingTable numCols={ TABLE_WIDTH } />
              }
            </tbody>

          </table>
        </div>

        { /* Render pagination controls at the bottom of this container */ }
        <div className={ styles.controls }>
          <PageControls 
            totalItems={ notifications.total }
            itemsPerPage={ NOTIFS_PER_PAGE }
            pageNum={ pageNum }
            setPageNum={ changePage }
            itemName="Notifications"
            useDropdown
          />
        </div>

      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Notifications;