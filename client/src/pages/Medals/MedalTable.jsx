/* ===== IMPORTS ===== */
import "./Medals.css";
import DetailedUsername from "../../components/DetailedUsername/DetailedUsername";

function MedalTable({ table, imageReducer }) {
  /* ===== VARIABLES ===== */
  const TABLE_LENGTH = 6;

  /* ===== MEDAL TABLE COMPONENT ===== */
  return (
    <div className="medals-table">
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
          { table.length === 0 ?

            // If the table array is empty, render a single row displaying this information to the user.
            <tr>
              <td colSpan={ TABLE_LENGTH } className="medals-empty">There have been no live submissions to this game's category!</td>
            </tr>
          :
            // Otherwise, we want to render a row for each medal table object in the table array.
            table.map(row => {
              return (
                <tr key={ `${ row.profile.username }-row` }>

                  { /* Position: render the position of the user */ }
                  <td>{ row.position }</td>

                  {/* User info - Render the user's profile picture, as well as their username */}
                  <td>
                    <DetailedUsername imageReducer={ imageReducer } profile={ row.profile } />
                  </td>

                  { /* Platinum - render the user's number of platinum medals */ }
                  <td>{ row.platinum }</td>

                  { /* Gold - render the user's number of gold medals */ }
                  <td>{ row.gold }</td>

                  { /* Silver - render the user's number of silver medals */ }
                  <td>{ row.silver }</td>

                  { /* Bronze - render the user's number of bronze medals */ }
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