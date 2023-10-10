/* ===== IMPORTS ===== */
import styles from "./Medals.module.css";
import DetailedUsername from "../../components/DetailedUsername/DetailedUsername";
import LoadingTable from "../../components/LoadingTable/LoadingTable.jsx";
import StylesHelper from "../../helper/StylesHelper.js";
import TableContent from "../../components/TableContent/TableContent.jsx";

function MedalTable({ table, imageReducer }) {
  /* ===== VARIABLES ===== */
  const TABLE_LENGTH = 6;
  
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { indexToParity } = StylesHelper();

  /* ===== MEDAL TABLE COMPONENT ===== */
  return (
    <div className={ styles.table }>
      <table>
        
        { /* Table header - specifies the information displayed in each cell of the medal table */ }
        <thead>
          <tr className="odd">
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
          { table ?
            <TableContent 
              items={ table } 
              emptyMessage={ "There have been no live submissions to this game's category!" } 
              numCols={ TABLE_LENGTH }
            >
              { table.map((row, index) => {
                return (
                  <tr className={ indexToParity(index) } key={ `${ row.profile.username }-row` }>
                    <td>{ row.position }</td>
                    <td>
                      <DetailedUsername imageReducer={ imageReducer } profile={ row.profile } />
                    </td>
                    <td>{ row.platinum }</td>
                    <td>{ row.gold }</td>
                    <td>{ row.silver }</td>
                    <td>{ row.bronze }</td>
                  </tr>
                );
              })}
            </TableContent>
          :
            <LoadingTable numCols={ TABLE_LENGTH } />
          }
        </tbody>
        
      </table>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default MedalTable;