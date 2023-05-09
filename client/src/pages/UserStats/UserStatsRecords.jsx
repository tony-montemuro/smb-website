/* ===== IMPORTS ===== */
import "./UserStats.css";
import { Link, useLocation } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function UserStatsRecords({ rankings }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[3];
  const category = path[4];
  const type = path[5];
  const TABLE_WIDTH = 4;

  /* ===== FUNCTIONS ===== */
  const { capitalize, cleanLevelName, recordB2F, dateB2F } = FrontendHelper();

  /* ===== USER STATS RECORDS COMPONENT ===== */
  return (
    <div className="stats-records">
      <h2>Best { capitalize(type) }s</h2>

      { /* For each mode, we want to render a rankings table */ }
      { Object.keys(rankings).map(mode => {
        return (

          // Records table 
          <table key={ mode }>

            { /* Table Header - shows what information is rendered in each cell */ }
            <thead>
              <tr>
                <th colSpan={ TABLE_WIDTH }>{ cleanLevelName(mode) }</th>
              </tr>
              <tr>
                <th>Level Name</th>
                <th>{ capitalize(type) }</th>
                <th>Position</th>
                <th>Date</th>
              </tr>
            </thead>

            { /* Table body - Renders the information itself */ }
            <tbody>
              { rankings[mode].map(level => {
                return (
                  <tr key={ level.level }>

                    { /* Element 1 - Level name [which includes a link to the chart] */ }
                    <td>
                      <Link
                        to={ { pathname: `/games/${ abb }/${ category }/${ type }/${ level.level }` } }
                        className="stats-records-links"
                      >
                        { cleanLevelName(level.level) }
                      </Link>
                    </td>

                    { /* Element 2 - Record */ }
                    <td>{ level.record && recordB2F(level.record, type) }</td>

                    { /* Element 3 - Position */ }
                    <td>{ level.position }</td>

                    { /* Element 4 - Submission date */ }
                    <td>{ level.date ? dateB2F(level.date) : level.date }</td>

                  </tr>
                );
              })}
            </tbody>

          </table>

        );
      })}
    </div>
  );
};

/* ===== EXPORTS ===== */
export default UserStatsRecords;