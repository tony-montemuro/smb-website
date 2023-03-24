/* ===== IMPORTS ===== */
import "./UserStats.css";
import { useLocation } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function UserStatsMedals({ medals, filter }) {
  /* ===== VARIABLES ====== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const type = path[5];

  /* ===== FUNCTIONS ===== */
  const { capitalize } = FrontendHelper();

  /* ===== USER STATS MEDALS COMPONENT ===== */
  return (
    <div className="stats-table">

      { /* Header and note */ }
      <div className="stats-table-header">
        <h2>{ capitalize(type) } Medals</h2>
        <i><b>Note:</b> Medals counts are computed using live records only!</i>
      </div>

      { medals ?
        // Render a table displaying the user's medals
        <table>

          { /* Table header - shows what information is rendered in each cell */ }
          <thead>
            <tr>
              <th>Position</th>
              <th>Platinum</th>
              <th>Gold</th>
              <th>Silver</th>
              <th>Bronze</th>
            </tr>
          </thead>

          { /* Table body - Render the information itself */ }
          <tbody>
            <tr>

              { /* Element 1 - Position */ }
              <td>{ medals.position }</td>

              { /* Element 2 - Platinum */ }
              <td>{ medals.platinum }</td>

              { /* Element 3 - Gold */ }
              <td>{ medals.gold }</td>

              { /* Element 4 - Silver */ }
              <td>{ medals.silver }</td>

              { /* Element 5 - Bronze */ }
              <td>{ medals.bronze }</td>

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

/* ===== EXPORTS ===== */
export default UserStatsMedals;