/* ===== IMPORTS ===== */
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./RecordTable.module.css";
import FancyLevel from "../../../components/FancyLevel/FancyLevel.jsx";
import FrontendHelper from "../../../helper/FrontendHelper.js";
import Username from "../../../components/Username/Username.jsx";

function RecordTableRow({ row, filter, allRecord, isAllGreater }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { recordB2F, timerType2TimeUnit } = FrontendHelper();
  
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];
  const type = path[4];
  const allLiveDiff = recordB2F(allRecord-row.record, type, row.level.timer_type);
  const timeUnit = `${ timerType2TimeUnit(row.level.timer_type) }s`;

  /* ===== RECORD TABLE ROW ===== */
  return (
    <tr key={ row.level.name }>
      <td className={ styles.level }>
        <Link to={ `/games/${ abb }/${ category }/${ type }/${ row.level.name }` }>
          <FancyLevel level={ row.level.name } />
        </Link>
      </td>
      <td className={ styles.record }>
        { row.record && recordB2F(row.record, type, row.level.timer_type) } 
        { row.record && filter === "live" && isAllGreater && 
          <span 
            title={ `The live record is ${ allLiveDiff } ${ type === "score" ? "points" : timeUnit } off of the overall record.` }
          >
            { ` (-${ allLiveDiff })` }
          </span>
        }
      </td>
      <td className={ styles.players }>
        { row.profiles.map((profile, index) => {
          return (
            <Fragment key={ profile.submission_id }>
              <span className={ styles.usernameWrapper }>
                <Username profile={ profile } />
                { index < row.profiles.length-1 ? "," : null }
              </span>
              { index < row.profiles.length-1 ? " " : null }
            </Fragment>
          );
        })}
      </td>
    </tr>
  );
};

/* ===== EXPORTS ===== */
export default RecordTableRow;