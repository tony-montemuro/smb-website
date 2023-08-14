/* ===== IMPORTS ===== */
import SubmissionHandlerLogic from "./SubmissionHandler.js";
import SubmissionRow from "./SubmissionRow";

function SubmissionTable({ submissions, onRowClick, isChecked, isNew }) {
  /* ===== VARIABLES ===== */
  let NUM_ROWS = isChecked ? 6 : 4;
  NUM_ROWS = isNew ? NUM_ROWS : NUM_ROWS+1;

  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { isClickable } = SubmissionHandlerLogic(isNew);

  /* ===== SUBMISSION TABLE COMPONENT ===== */
  return (
    <div className={ `submission-handler-submission-table ${ isChecked ? "submission-handler-checked" : "" }` }>
      <table>

      { /* Submission table header - Render the description of what's contained in each row. If the isChecked
      parameter is true, a few extra headers will be rendered. If the isNew parameter is true, an additional column will
      be rendered. */ }
      <thead>
        <tr>
          { isChecked && <th>Action</th> }
          <th>{ isNew ? "Submitted" : "Reported" }</th>
          { !isNew && <th>Reported By</th> }
          <th>User</th>
          { isChecked && <th>Game</th> }
          <th>Level</th>
          <th>Record</th>
        </tr>
      </thead>

      { /* Submission table body - Render information about each submission in submissions array */ }
      <tbody>
        { submissions.length > 0 ?

          // If any submissions exist, render a submission row for each submission in the array.
          submissions.map(submission => {
            return <SubmissionRow 
              submission={ submission } 
              onClick={ isClickable(submission) ? onRowClick : null } 
              isChecked={ isChecked } 
              isNew={ isNew }
              key={ submission.details.id } 
            />
          })
        :

          // Otherwise, render a message to the user. The user will depend on whether or not `isChecked` is true or false.
          <tr className="submission-handler-empty-row">
            <td colSpan={ NUM_ROWS }>
              { isChecked ?
                <i>No submissions have been checked yet.</i>
              :
                <i>This game has no more { isNew ? "new" : "reported" } submissions.</i>
              }
            </td>
          </tr>
          
        }
        
      </tbody>

      </table>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default SubmissionTable;