/* ===== IMPORTS ===== */
import styles from "./RecordTable.module.css";
import { useLocation } from "react-router-dom";
import FrontendHelper from "../../../helper/FrontendHelper";
import LevelHelper from "../../../helper/LevelHelper.js";
import RecordTableRow from "./RecordTableRow";

function RecordTable({ recordTable, filter, mode, allGreater }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const type = location.pathname.split("/")[4];
  const levels = recordTable[filter][mode];

  /* ===== FUNCTIONS ===== */
  const { capitalize } = FrontendHelper();
  const { levelB2F } = LevelHelper();

  /* ===== RECORD TABLE COMPONENT ===== */
  return (
    <div>
      <h3>{ levelB2F(mode) }</h3>
      <div className="table">
        <table key={ mode }>

          { /* Record table header - specifies the information displayed in each cell of the record table */ }
          <thead>
            <tr>
              <th className={ styles.level }>Level Name</th>
              <th className={ styles.type }>{ capitalize(type) }</th>
              <th className={ styles.players }>Player(s)</th>
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