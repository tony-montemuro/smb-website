/* ===== IMPORTS ===== */
import "./Records.css";
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import RecordsLogic from "./Records.js";
import Username from "../../components/Username/Username.jsx";

function RecordTable({ mode, allLiveFilter, recordTable }) {
  /* ===== VARIABLES ===== */
  const TABLE_LENGTH = 3;
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];
  const type = path[4];

  /* ===== FUNCTIONS ===== */
  const { capitalize, cleanLevelName, recordB2F } = FrontendHelper();
  const { allGreater } = RecordsLogic();

  /* ===== RECORD TABLE COMPONENT ===== */
  return (
    <table key={ mode }>

      { /* Record table header - display the name of the mode */ }
      <thead>
        <tr>
          <th colSpan={ TABLE_LENGTH }>{ cleanLevelName(mode) }</th>
        </tr>
      </thead>

      { /* Record table body */ }
      <tbody>

        { /* First row explains each cell */ }
        <tr className="records-info-row">
          <td>Level Name</td>
          <td>{ capitalize(type) }</td>
          <td>Player(s)</td>
        </tr>

        { /* Render a row for each level */ }
        { recordTable[allLiveFilter][mode].map((row, index) => {
          return (
            <tr className={ allGreater(recordTable, mode, index) ? "records-different-row" : "records-same-row" } key={ row.level }>

              { /* First element is the name of the level, which allows user to navigate to that level's chart */ }
              <td>
                <Link className="records-level-link" to={ `/games/${ abb }/${ category }/${ type }/${ row.level }` }>
                  { cleanLevelName(row.level) }
                </Link>
              </td>

              { /* Second element is the record */ }
              <td>{ row.record && recordB2F(row.record, type, row.level.timer_type) }</td>

              { /* Third element is the profiles of each user who has record. This is a list of links, as each name will link to their
              user profile. */ }
              <td>
                { row.profiles.map((profile, index) => {
                  return (
                    <Fragment key={ profile.id }>
                      <Username profile={ profile } />
                      { index < row.profiles.length-1 ? ", " : null }
                    </Fragment>
                  );
                })}
              </td>

            </tr>
          );
        })}
        
      </tbody>
    </table>
  );
};

/* ===== EXPORTS ===== */
export default RecordTable;