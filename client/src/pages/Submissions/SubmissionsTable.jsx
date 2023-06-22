/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import FrontendHelper from "../../helper/FrontendHelper";
import LaunchIcon from "@mui/icons-material/Launch";
import Username from "../../components/Username/Username";

function SubmissionsTable({ submissions, isApproved, game, handleClick }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, cleanLevelName, dateB2F, recordB2F, getTimeDifference } = FrontendHelper();

  /* ===== SUBMISSIONS TABLE COMPONENT ===== */
  return (
    <div className="submissions-table">
      <table>

        { /* Table header: specifies the information displayed in each cell of the table*/ }
        <thead>
          <tr>
            <th>Time Ago</th>
            <th>User</th>

            { /* The approved table has an additional column: Game. Renders only if isApproved is true. */ }
            { isApproved && <th>Game</th> }

            <th>Level</th>
            <th>Record</th>
            <th>Date</th>
            <th>Region</th>
            <th>Monkey</th>
            <th>Proof</th>
            <th>Live</th>
            <th>Comment</th>

          </tr>
        </thead>

        { /* Table body - Render the actual contents of the submission table from the submissions array. */ }
        <tbody>
        { submissions.map(row => {
          // variables for a particular row
          const category = row.level.misc ? "misc" : "main";
          const type = row.score ? "score" : "time";

          // table row component
          return <tr key={ row.details.submitted_at } onClick={ () => handleClick(row) }>

            { /* Time ago: Render how long ago the submission occured. */ }
            <td>{ getTimeDifference(row.details.id) }</td>

            { /* User data: Render the user's country and username */ }
            <td><Username country={ row.profile.country } profileId={ row.profile.id } username={ row.profile.username } /></td>

            { /* Additional table data for approved table only: game data. Render a Link tag that links to the games page,
            and also displays the name of the game. */ }
            { isApproved &&
              <td>
                <Link to={ `/games/${ row.game.abb }`}>{ row.game.name }</Link>
              </td>
            }

            { /* Level name data: Render a Link tag that links to the levelboard associated with the submission, that displays the
            name of the level, as well as the type of submission. */ }
            <td>
              <Link to={ `/games/${ game }/${ category }/${ type }/${ row.level.name }` }>
                { cleanLevelName(row.level.name) } ({ capitalize(type) })
              </Link>
            </td>

            { /* Record data: Render the record of the submission. */ }
            <td>{ recordB2F(row.details.record, type) }</td>

            { /* Submission date data: Render the submission date of the submission. */ }
            <td>{ dateB2F(row.details.submitted_at) }</td>

            { /* Region data: Render the region associated with the submission. */ }
            <td>{ row.details.region.region_name }</td>

            { /* Monkey data: Render the monkey associated with the submission. */ }
            <td>{ row.details.monkey.monkey_name }</td>

            { /* Proof data: If a proof exists, render a launch icon that links to the proof. */ }
            <td>
              { row.details.proof && 
                <div className="submissions-svg-wrapper">
                  <a href={ row.details.proof } target="_blank" rel="noopener noreferrer"><LaunchIcon fontSize="small" /></a>
                </div>
              }
            </td>

            { /* If the details.live boolean is set to true, render a checkmark. */ }
            <td>
              { row.details.live &&
                <div className="submissions-svg-wrapper">
                  <CheckIcon />
                </div>
              }
            </td>

            {/* Comment data: Render the comment associated with the submission. */}
            <td>{ row.details.comment }</td>

          </tr>
        })}
        </tbody>

      </table>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default SubmissionsTable;