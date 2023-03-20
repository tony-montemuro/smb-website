/* ===== IMPORTS ===== */
import "./Totalizer.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

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

      { /* Table title */ }
      <h2>{ capitalize(type) } Totals</h2>

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
      
        { /* Table header information: specifies the information displayed in each cell of the board */ }
        <thead>
          <tr>
            <th>Position</th>
            <th>Name</th>
            <th>Total { capitalize(type) }</th>
          </tr>
        </thead>

        { /* Table */ }
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
                <td>{ row.position }</td>
                <td>
                  <div className="totals-user-info">
                  <div className="totals-user-image"><SimpleAvatar url={ row.user.avatar_url } size={ IMG_LENGTH } imageReducer={ imageReducer } /></div>
                    { row.user.country &&
                      <div><span className={ `fi fi-${ row.user.country.toLowerCase() }` }></span></div>
                    }
                    <div><Link to={ `/user/${ row.user.id }` }>{ row.user.username }</Link></div>
                  </div>
                </td>
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