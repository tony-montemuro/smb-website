/* ===== IMPORTS ===== */
import "./Records.css";
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import RecordsLogic from "./Records.js";

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
        { recordTable[allLiveFilter][mode].map((level, index) => {
          return (
            <tr className={ allGreater(recordTable, mode, index) ? "records-different-row" : "records-same-row" } key={ level.level }>

              { /* First element is the name of the level, which allows user to navigate to that level's chart */ }
              <td>
                <Link className="records-level-link" to={ `/games/${ abb }/${ category }/${ type }/${ level.level }` }>
                  { cleanLevelName(level.level) }
                </Link>
              </td>

              { /* Second element is the record */ }
              <td>{ level.record && recordB2F(level.record, type) }</td>

              { /* Third element is the names of each user who has record. This is a list of links, as each name will link to their
              user profile. */ }
              <td>
                { level.names.map((user, index) => {
                  return (
                    <Fragment key={ user.id }>
                      <Link to={ `/user/${ user.id }` }>{ user.username }</Link>
                      { index < level.names.length-1 ? ", " : null }
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