/* ===== IMPORTS ===== */
import "./Totalizer.css";
import { useState } from "react";
import DetailedUsername from "../../components/DetailedUsername/DetailedUsername";
import FrontendHelper from "../../helper/FrontendHelper";

function TotalizerTable({ type, totals, imageReducer }) {
  /* ===== VARIABLES ===== */
  const TABLE_LENGTH = 3;

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
              return <tr key={ `${ row.profile.username }-row` }>

                { /* Position: render the position of the user */ }
                <td>{ row.position }</td>

                {/* User info - Render the user's profile picture, as well as their username */}
                <td>
                  <DetailedUsername
                    imageReducer={ imageReducer }
                    country={ row.profile.country }
                    profileId={ row.profile.id }
                    username={ row.profile.username }
                  />
                </td>

                { /* Total - render the actual total */ }
                <td>{ secondsToHours(row.total, type) }</td>

              </tr>  
            })}

        </tbody>

      </table>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default TotalizerTable;