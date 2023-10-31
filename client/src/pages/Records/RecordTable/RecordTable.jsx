/* ===== IMPORTS ===== */
import styles from "../Records.module.css";
import { useLocation } from "react-router-dom";
import FrontendHelper from "../../../helper/FrontendHelper";
import RecordTableRow from "./RecordTableRow";

function RecordTable({ recordTable, filter, mode, allGreater }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const type = location.pathname.split("/")[4];
  const levels = recordTable[filter][mode];

  /* ===== FUNCTIONS ===== */
  const { capitalize, cleanLevelName } = FrontendHelper();

  /* ===== RECORD TABLE COMPONENT ===== */
  return (
    <div>
      <h3>{ cleanLevelName(mode) }</h3>
      <div className="table">
        <table className={ styles.recordsTable } key={ mode }>

          { /* Record table header - specifies the information displayed in each cell of the record table */ }
          <thead>
            <tr>
              <th>Level Name</th>
              <th>{ capitalize(type) }</th>
              <th>Player(s)</th>
            </tr>
          </thead>

          { /* Record table body - render a row for each records table object in the record table array */ }
          <tbody>
            { levels.map((row, index) => {
              return <RecordTableRow 
                row={ row }
                filter={ filter }
                allRecord={ recordTable.all[mode][index].record }
                isAllGreater={ allGreater(mode, index) }
                key={ `${ mode }_${ row.level.name }` }
              />;
            })}
            
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default RecordTable;