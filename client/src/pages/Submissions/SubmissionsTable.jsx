/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function SubmissionsTable({ submissions, isApproved, game, buttonIsDisabled, buttonFunc }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, cleanLevelName, dateB2F, recordB2F } = FrontendHelper();

  /* ===== SUBMISSIONS TABLE COMPONENT ===== */
  return (
    <table>

      { /* Table header: specifies the information displayed in each cell of the table*/ }
      <thead>
        <tr>
          <th>User</th>

          { /* The approved table has an additional column: Game. Renders only if isApproved is true. */ }
          { isApproved && <th>Game</th> }

          <th>Level Name</th>
          <th>Type</th>
          <th>Record</th>
          <th>Date</th>
          <th>Region</th>
          <th>Live Status</th>
          <th>Proof</th>
          <th>Comment</th>

          { /* The approved submissions table has an Unapprove button column, while the unapporoved submissions table has
          an Approved button column. The header for this column is reflected here. */ }
          { isApproved ? <th>Unapprove</th> : <th>Approved</th> }

        </tr>
      </thead>

      { /* Table body - Render the actual contents of the submission table from the submissions array. */ }
      <tbody>
      { submissions.map(row => {
        // variables for a particular row
        const category = row.level.misc ? "misc" : "main";
        const type = row.score ? "score" : "time";

        // table row component
        return <tr key={ row.details.submitted_at }>

          { /* User data: Render the user's country and username */ }
          <td>
            <div className="submissions-user-info">
              { row.user.country &&
                <div><span className={ `fi fi-${ row.user.country.toLowerCase() }` }></span></div>
              }
              <div><Link to={ `/user/${ row.user.id }` }>{ row.user.username }</Link></div>
            </div>
          </td>

          { /* Additional table data for approved table only: game data. Render a Link tag that links to the games page,
          and also displays the name of the game. */ }
          { isApproved &&
            <td>
              <Link to={ `/games/${ row.game.abb }`}>{ row.game.name }</Link>
            </td>
          }

          { /* Level name data: Render a Link tag that links to the levelboard associated with the submission, and also display
          the name of the level. */ }
          <td>
            <Link to={ `/games/${ game }/${ category }/${ type }/${ row.level.name }` }>
            { cleanLevelName(row.level.name) }
            </Link>
          </td>

          { /* Type data: Render whether or not the submission was to a score or time chart. */ }
          <td>{ capitalize(type) }</td>

          { /* Record data: Render the record of the submission. */ }
          <td>{ recordB2F(row.details.record, type) }</td>

          { /* Submission date data: Render the submission date of the submission. */ }
          <td>{ dateB2F(row.details.submitted_at) }</td>

          { /* Region data: Render the region associated with the submission. */ }
          <td>{ row.details.region.region_name }</td>

          { /* If the details.live boolean is set to true, render Live. Otherwise, render Non-live. */ }
          { row.details.live ? <td>Live</td> : <td>Non-live</td> }

          { /* Proof data: If a proof exists, render an a tag that links to the proof. Otherwise, do not render anything. */ }
          <td>{ row.details.proof ? <a href={ row.details.proof } target="_blank" rel="noopener noreferrer">☑️</a> : null }</td>

          {/* Comment data: Render the comment associated with the submission. */}
          <td>{ row.details.comment }</td>

          { /* Button data: If the isApproved flag is set to true, render the Unapprove button. Otherwise, render the
          Approve button. */ }
          <td>
            { isApproved ?
              <button onClick={ () => buttonFunc(row) } disabled={ buttonIsDisabled }>Unapprove</button>
            :
              <button onClick={ () => buttonFunc(row) } disabled={ buttonIsDisabled }>Approve</button>
            }
          </td>

        </tr>
      })}
      </tbody>

    </table>
  );
};

/* ===== EXPORTS ===== */
export default SubmissionsTable;