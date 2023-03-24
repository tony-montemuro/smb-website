/* ===== IMPORTS ====== */
import "./UserStats.css";
import { useLocation } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function UserStatsTotal({ total, filter }) {
  /* ===== VARIABLES ====== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const type = path[5];

  /* ===== FUNCTIONS ===== */
  const { capitalize, secondsToHours } = FrontendHelper();
  
  /* ===== USER STATS TOTAL COMPONENT ===== */
  return (
    <div className="stats-table">
      <h2>{ capitalize(type) } Total</h2>

      { /* If the total field exists... */ }
      { total ?

        // Render a table displaying the user's total
        <table>

          { /* Table header - shows what information is rendered in each cell */ }
          <thead>
            <tr>
              <th>Position</th>
              <th>{ capitalize(type) } Total</th>
            </tr>
          </thead>

          { /* Table body - Render the information itself */ }
          <tbody>
            <tr>

              { /* Element 1 - Position */ }
              <td>{ total.position }</td>
              
              { /* Element 2: Total */ }
              <td>{ secondsToHours(total.total, type) }</td>

            </tr>
          </tbody>

        </table>
      :
        filter === "live" ?

          // If the filter is set to live, render this message.
          <p><i>This user has not submitted any live records to this category.</i></p>

        :

          // Otherwise, render this message.
          <p><i>This user has not submitted to this category.</i></p>
          
      }
    </div>
  );
};

/* ===== EXPORTS ====== */
export default UserStatsTotal;