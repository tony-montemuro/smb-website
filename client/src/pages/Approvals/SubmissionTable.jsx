/* ===== IMPORTS ===== */
import SubmissionRow from "./SubmissionRow";

function SubmissionTable({ submissions, onRowClick, isChecked }) {
  /* ===== VARIABLES ===== */
  const NUM_ROWS = isChecked ? 6 : 4;

  /* ===== SUBMISSION TABLE COMPONENT ===== */
  return (
    <table>

      { /* Submission table header - Render the description of what's contained in each row. If the isChecked
      parameter is true, a few extra headers will be rendered. */ }
      <thead>
        <tr>
          { isChecked && <th>Action</th> }
          <th>Time Ago</th>
          <th>User</th>
          { isChecked && <th>Game</th> }
          <th>Level</th>
          <th>Record</th>
        </tr>
      </thead>

      { /* Submission table body - Render information about each submission in submissions array */ }
      <tbody>
        { submissions.length > 0 ?
          submissions.map(submission => {
            return <SubmissionRow submission={ submission } onClick={ onRowClick } isChecked={ isChecked } key={ submission.details.id } />
          })
        :
          <tr className="approvals-empty-row">
            <td colSpan={ NUM_ROWS }>
              { isChecked ?
                <i>No submissions have been checked yet.</i>
              :
                <i>This game has no more new submissions.</i>
              }
            </td>
          </tr>
        }
        
      </tbody>

    </table>
  );
};

/* ===== EXPORTS ===== */
export default SubmissionTable;