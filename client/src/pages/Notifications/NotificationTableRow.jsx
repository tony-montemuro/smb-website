/* ===== IMPORTS ===== */
import "./Notifications.css";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function NotificationTableRow({ row, notifications, setNotifications, toggleSelection }) {
  /* ===== VARIABLES ===== */
  const category = row.level.misc ? "misc" : "main";
  const type = row.score ? "score" : "time";

  // helper functions
  const { cleanLevelName, capitalize, dateB2F, recordB2F } = FrontendHelper();

  /* ===== NOTIFICATION TABLE ROW COMPONENT ===== */
  return (
    <tr key={ row.notif_date }>

      { /* Notification selector - render a checkbox that allows the user to select a notification for deletion */ }
      <td>
        <input
          type="checkbox"
          checked={ notifications.selected.includes(row.notif_date) }
          onChange={() => toggleSelection(row.notif_date) }
        />
      </td>

      { /* Details button - render a button that allows the user to pull up a popup associated with the current notification */ }
      <td><button onClick={ () => setNotifications({ ...notifications, current: row }) }>Info</button></td>

      { /* Render the type of notification */ }
      <td>{ capitalize(row.notif_type) }</td>

      { /* Render the game associated with the notification as a link */ }
      <td>
        <Link to={`/games/${ row.level.mode.game.abb }`}>
          { row.level.mode.game.name }
        </Link>
      </td>

      { /* Render the level associated with the notification as a link */ }
      <td>
        <Link to={`/games/${ row.level.mode.game.abb }/${ category }/${ type }/${ row.level.name }`}>
          { cleanLevelName(row.level.name) } ({ capitalize(type) })
        </Link>
      </td>

      { /* Render the record associated with the notification */ }
      <td>{ recordB2F(row.record, row.type) }</td>

      { /* Render the date of the notification */ }
      <td>{ dateB2F(row.notif_date) }</td>

    </tr>
  );
};

/* ===== EXPORTS ===== */
export default NotificationTableRow;