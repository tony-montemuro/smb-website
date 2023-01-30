import "./notifications.css";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationsInit from "./NotificationsInit";

function Notifications({ cache }) {
  // states and functions from init file
  const { loading, notifications, init } = NotificationsInit();

  // helper functions
  const { cleanLevelName, capitalize } = FrontendHelper();

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
        { loading ?
          <p>Loading...</p>
        :
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={() => console.log("select all")}
                  />
                </th>
                <th>Type</th>
                <th>Game</th>
                <th>Level</th>
                <th>Record</th>
                <th>Details</th>
                <th>Notification Date</th>
              </tr>
            </thead>
            <tbody>
              { notifications.map(row => {
                return <tr key={ row.id }>
                  <td>
                    <input
                      type="checkbox"
                      onChange={() => console.log(`select ${row.id}`)}
                    />
                  </td>
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
                  <td>{ row.record }</td>
                  <td>Info</td>
                  <td>{ row.notif_date.slice(0, 10) }</td>
                </tr>
              }) }
            </tbody>
          </table> 
        }
      </div>
    </>
  );
};

export default Notifications;