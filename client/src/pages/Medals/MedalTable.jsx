/* ===== IMPORTS ===== */
import "./Medals.css";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function MedalTable({ medals, type, imageReducer }) {
  /* ===== VARIABLES ===== */
  const TABLE_LENGTH = 6;
  const IMG_LENGTH = 50;

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== MEDAL TABLE COMPONENT ===== */
  return (
    <div className="medals-table" key={ type }>

      { /* Table title - Used to show the type of table */ }
      <h2>{ capitalize(type) } Medal Table</h2>
      
      <table>
        
        { /* Table header - specifies the information displayed in each cell of the medal table */ }
        <thead>
          <tr>
            <th>Position</th>
            <th>Name</th>
            <th>Platinum</th>
            <th>Gold</th>
            <th>Silver</th>
            <th>Bronze</th>
          </tr>
        </thead>

        { /* Table body - render a row for each medals table object in the array. */ }
        <tbody>
          { medals[type].length === 0 ?

            // If the medals[type] array is empty, render a single row displaying this information to the user.
            <tr>
              <td colSpan={ TABLE_LENGTH } className="medals-empty">There have been no live submissions to this game's category!</td>
            </tr>
          :
            // Otherwise, we want to render a row for each medal table object in the medals[type] array.
            medals[type].map(row => {
              return (
                <tr key={ `${ row.user.username }-row` }>
                  <td>{ row.position }</td>
                  <td>
                      <div className="medals-user-info">
                          <div className="medals-user-image">
                            <SimpleAvatar url={ row.user.avatar_url } size={ IMG_LENGTH } imageReducer={ imageReducer } />
                          </div>
                          { row.user.country &&
                            <div><span className={ `fi fi-${ row.user.country.toLowerCase() }` }></span></div>
                          }
                          <div><Link to={ `/user/${ row.user.id }` }>{ row.user.username }</Link></div>
                      </div>
                  </td>
                  <td>{ row.platinum }</td>
                  <td>{ row.gold }</td>
                  <td>{ row.silver }</td>
                  <td>{ row.bronze }</td>
                </tr>
              );
            })

          }
        </tbody>
      </table>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default MedalTable;