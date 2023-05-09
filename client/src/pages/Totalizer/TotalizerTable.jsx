/* ===== IMPORTS ===== */
import "./Totalizer.css";
import { useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";
import Username from "../../components/Username/Username.jsx";

function TotalizerTable({ type, totals, imageReducer }) {
  /* ===== VARIABLES ===== */
  const TABLE_LENGTH = 3;
  const IMG_LENGTH = 50;

  /* ===== STATES ===== */
  const [tableState, setTableState] = useState("live");

  /* ===== FUNCTIONS ===== */
  const { capitalize, secondsToHours } = FrontendHelper();

  /* ===== BOARD COMPONENT ===== */
  return (
    <div className="totalizer-table">

      { /* Table input - allows user to toggle between all and live mode */ }
      <div className="totalizer-input">
        <label htmlFor="all">Live-{ type }s only: </label>
        <input
          id="all"
          type="checkbox"
          checked={ tableState === "live" }
          onChange={ () => setTableState(tableState === "live" ? "all" : "live") }
        />
      </div>

      { /* Table */ } 
      <table>
      
        { /* Table header - specifies the information displayed in each cell of the board */ }
        <thead>
          <tr>
            <th>Position</th>
            <th>Name</th>
            <th>Total { capitalize(type) }</th>
          </tr>
        </thead>

        { /* Table body - render a row for each medals table object in the array. */ }
        <tbody>
          { totals[tableState].length === 0 ? 

            // If the totals[tableState] array is empty, render a single row displaying this information to the user.
            <tr>
              <td colSpan={ TABLE_LENGTH } className="totalizer-empty">
                There have been no { tableState === "live" && tableState } submissions to this game's category!
              </td>
            </tr>
          :

            // Otherwise, we want to render a row for each totalizer object in the totals[totalState] array.
            totals[tableState].map(row => {
              return <tr key={ `${ row.user.username }-row` }>

                { /* Position: render the position of the user */ }
                <td>{ row.position }</td>

                {/* User info - Render the user's profile picture, as well as their username */}
                <td>
                  <div className="totals-user-info">
                    <div className="totals-user-image">
                      <SimpleAvatar url={ row.user.avatar_url } size={ IMG_LENGTH } imageReducer={ imageReducer } />
                    </div>
                    <Username country={ row.user.country } username={ row.user.username } userId={ row.user.id } />
                  </div>
                </td>

                { /* Total - render the actual total */ }
                { type === "score" ?
                  // If the type is score, we will simply render the total
                  <td>{ row.total }</td>
                : 
                  // Otherwise, we need to convert to an hour format
                  <td>{ secondsToHours(row.total, type) }</td>
                }

              </tr>  
            })}

        </tbody>

      </table>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default TotalizerTable;