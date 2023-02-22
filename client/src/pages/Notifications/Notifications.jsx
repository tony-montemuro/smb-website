import "./notifications.css";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationsInit from "./NotificationsInit";
import NotificationPopup from "./NotificationPopup";

function Notifications({ cache }) {
  // states and functions from init file
  const { 
    loading,
    notifications, 
    init, 
    setNotifications,
    toggleSelection,
    toggleSelectionAll,
    removeSelected
  } = NotificationsInit();

  // helper functions
  const { cleanLevelName, capitalize, dateB2F, recordB2F } = FrontendHelper();

  // code that is executed when the page first loads
  useEffect(() => {
    if (cache.notifications) {
      init(cache.notifications)
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cache.notifications]);

  // notification component
  return (
    <>
      <div className="notifications-header">
        <div className="notifications-header-info">
          <h1>Notifications</h1>
          <p><i>Below is the list of all your notifications. There are 4 types of notifications:</i></p>
        </div>
        <ol>
          <li><b>Approvals:</b> A moderator has approved of your submission.</li>
          <li><b>Inserts:</b> A moderator has submitted a submission on your behalf.</li>
          <li><b>Updates:</b> A moderator has modified one or more properties of your submission.</li>
          <li><b>Deletes:</b> A moderator has deleted your submission.</li>
        </ol>
      </div>
      <div className="notifications-body">
        <button onClick={ removeSelected } disabled={ notifications.selected.length === 0 }>Delete</button>
        { loading ?
          <p>Loading...</p>
        :
          <table>
            <thead>
              <tr>
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
            <tbody>
              { notifications.all.length > 0 ?
                notifications.all.map(row => {
                  return <tr key={ row.id }>
                    <td>
                      <input
                        type="checkbox"
                        checked={ notifications.selected.includes(row.id) }
                        onChange={() => toggleSelection(row.id)}
                      />
                    </td>
                    <td><button onClick={ () => setNotifications({ ...notifications, current: row }) }>Info</button></td>
                    <td>{ capitalize(row.notif_type) }</td>
                    <td>
                      <Link to={`/games/${ row.level.mode.game.abb }`}>
                        { row.level.mode.game.name }
                      </Link>
                    </td>
                    <td>
                      <Link to={`/games/${ row.level.mode.game.abb }/${ row.level.misc ? "misc" : "main" }/${ row.type }/${ row.level.name }`}>
                        { cleanLevelName(row.level.name) } ({ capitalize(row.type) })
                      </Link>
                    </td>
                    <td>{ recordB2F(row.record, row.type) }</td>
                    <td>{ dateB2F(row.notif_date) }</td>
                  </tr>
                })
              :
                <tr>
                  <td colSpan={ 7 }>
                    <i>You have no notifications!</i>
                  </td>
                </tr>
              }
            </tbody>
          </table> 
        } 
      </div>
      <NotificationPopup hook={ { state: notifications, setState: setNotifications } } />
    </>
  );
};

export default Notifications;