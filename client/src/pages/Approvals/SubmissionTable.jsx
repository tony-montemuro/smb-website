/* ===== IMPORTS ===== */
import FrontendHelper from "../../helper/FrontendHelper";
import Username from "../../components/Username/Username";

function SubmissionTable({ submissions, onRowClick, isChecked }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { getTimeAgo, capitalize, cleanLevelName, recordB2F } = FrontendHelper();

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
        { submissions.map(submission => {
          // declare variables
          const details = submission.details;
          const profile = submission.profile;
          const type = submission.score ? "score" : "time";

          return (
            <tr onClick={ () => onRowClick(submission) }>

              { /* If isChecked is true, render the action for the submission */ }
              { isChecked && 
                 <td>
                  <div>{ submission.action }</div>
                </td>
              }

              { /* Render how long ago the submission was submitted */ }
              <td>
                <div>{ getTimeAgo(details.id) }</div>
              </td>

              { /* Render the username of the person who submitted it */ }
              <td>
                <div>
                  <Username 
                    country={ profile.country } 
                    profileId={ profile.id } 
                    username={ profile.username } 
                  />
                </div>
              </td>

              { /* If isChecked is true, render the name of the game. */ }
              { isChecked &&
                <td>
                  <div>{ submission.level.mode.game.name }</div>
                </td>
              }

              { /* Render the name of the level, as well as the type of submission */ }
              <td>
                <div>
                  { `${ cleanLevelName(submission.level.name) } (${ capitalize(type) })` }
                </div>
              </td>

              { /* Render the record */ }
              <td>
                <div>{ recordB2F(details.record, type) }</div>
              </td>
            
            </tr>
          );
        })}
      </tbody>

    </table>
  );
};

/* ===== EXPORTS ===== */
export default SubmissionTable;