/* ===== IMPORTS ===== */
import "./Notifications.css";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function NotificationTableRow({ row, notifications, handleRowClick, toggleSelection }) {
  /* ===== VARIABLES ===== */
  const category = row.level.misc ? "misc" : "main";
  const type = row.score ? "score" : "time";

  // helper functions
  const { cleanLevelName, capitalize, recordB2F, getTimeDifference } = FrontendHelper();

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

      { /* Render how long ago the notification was receieved. */ }
      <td onClick={ () => handleRowClick(row) }>{ getTimeDifference(row.notif_date) }</td>

      { /* Render the type of notification */ }
      <td onClick={ () => handleRowClick(row) }>{ capitalize(row.notif_type) }</td>

      { /* Render the game associated with the notification as a link */ }
      <td onClick={ () => handleRowClick(row) }>
        <Link to={`/games/${ row.level.mode.game.abb }`}>
          { row.level.mode.game.name }
        </Link>
      </td>

      { /* Render the level associated with the notification as a link */ }
      <td onClick={ () => handleRowClick(row) }>
        <Link to={`/games/${ row.level.mode.game.abb }/${ category }/${ type }/${ row.level.name }`}>
          { cleanLevelName(row.level.name) } ({ capitalize(type) })
        </Link>
      </td>

      { /* Render the record associated with the notification */ }
      <td onClick={ () => handleRowClick(row) }>{ recordB2F(row.record, row.type) }</td>

    </tr>
  );
};

/* ===== EXPORTS ===== */
export default NotificationTableRow;