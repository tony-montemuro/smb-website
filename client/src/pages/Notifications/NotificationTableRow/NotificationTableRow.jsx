/* ===== IMPORTS ===== */
import styles from "./NotificationTableRow.module.css";
import FancyLevel from "../../../components/FancyLevel/FancyLevel.jsx";
import FrontendHelper from "../../../helper/FrontendHelper";
import TypeSymbol from "../TypeSymbol";

function NotificationTableRow({ row, notifications, pageNum, handleRowClick, toggleSelection }) {
  /* ===== VARIABLES ===== */
  const type = row.score ? "score" : "time";

  // helper functions
  const { capitalize, recordB2F, getTimeAgo, categoryB2F } = FrontendHelper();

  /* ===== NOTIFICATION TABLE ROW COMPONENT ===== */
  return (
    <tr className={ styles.tableRow } key={ row.notif_date }>

      { /* Notification selector - render a checkbox that allows the user to select a notification for deletion */ }
      <td className={ styles.checkbox }>
        <input
          type="checkbox"
          checked={ notifications.selected[pageNum].includes(row.notif_date) }
          onChange={() => toggleSelection(row.notif_date, pageNum) }
        />
      </td>
      
      <td onClick={ () => handleRowClick(row) }>
        <div className={ styles.type }>
          <TypeSymbol type={ row.notif_type } />
        </div>
      </td>
      <td onClick={ () => handleRowClick(row) }>{ getTimeAgo(row.notif_date) }</td>
      <td onClick={ () => handleRowClick(row) }>
        { row.level.mode.game.name }
      </td>
      <td onClick={ () => handleRowClick(row) }>
        { categoryB2F(row.level.category) }
      </td>
      <td onClick={ () => handleRowClick(row) }>
        <FancyLevel level={ row.level.name } /> ({ capitalize(type) })
      </td>
      <td onClick={ () => handleRowClick(row) }>{ recordB2F(row.record, type, row.level.timer_type) }</td>

    </tr>
  );
};

/* ===== EXPORTS ===== */
export default NotificationTableRow;