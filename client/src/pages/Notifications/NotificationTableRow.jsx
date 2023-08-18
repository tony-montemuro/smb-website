/* ===== IMPORTS ===== */
import "./Notifications.css";
import FrontendHelper from "../../helper/FrontendHelper";
import TypeSymbol from "./TypeSymbol";

function NotificationTableRow({ row, notifications, handleRowClick, toggleSelection }) {
  /* ===== VARIABLES ===== */
  const type = row.score ? "score" : "time";

  // helper functions
  const { cleanLevelName, capitalize, recordB2F, getTimeAgo, categoryB2F } = FrontendHelper();

  /* ===== NOTIFICATION TABLE ROW COMPONENT ===== */
  return (
    <tr key={ row.notif_date }>

      { /* Notification selector - render a checkbox that allows the user to select a notification for deletion */ }
      <td className="notifications-select-element">
        <input
          type="checkbox"
          checked={ notifications.selected.includes(row.notif_date) }
          onChange={() => toggleSelection(row.notif_date) }
        />
      </td>

      { /* Render the type of notification */ }
      <td onClick={ () => handleRowClick(row) }>
        <div className="notifications-type">
          <TypeSymbol type={ row.notif_type } />
        </div>
      </td>

      { /* Render how long ago the notification was receieved. */ }
      <td onClick={ () => handleRowClick(row) }>{ getTimeAgo(row.notif_date) }</td>

      { /* Render the game associated with the notification */ }
      <td onClick={ () => handleRowClick(row) }>
        { row.level.mode.game.name }
      </td>

      { /* Render the category associated with the level of the notification */ }
      <td onClick={ () => handleRowClick(row) }>
        { categoryB2F(row.level.category) }
      </td>

      { /* Render the level associated with the notification */ }
      <td onClick={ () => handleRowClick(row) }>
        { cleanLevelName(row.level.name) } ({ capitalize(type) })
      </td>

      { /* Render the record associated with the notification */ }
      <td onClick={ () => handleRowClick(row) }>{ recordB2F(row.record, type) }</td>

    </tr>
  );
};

/* ===== EXPORTS ===== */
export default NotificationTableRow;