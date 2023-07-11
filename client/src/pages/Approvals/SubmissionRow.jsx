/* ===== IMPORTS ===== */
import ActionSymbol from "./ActionSymbol";
import FrontendHelper from "../../helper/FrontendHelper";
import Username from "../../components/Username/Username.jsx"

function SubmissionRow({ submission, onClick, isChecked }) {
  /* ===== VARIABLES ===== */
  const details = submission.details;
  const profile = submission.profile;
  const type = submission.score ? "score" : "time";

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { getTimeAgo, capitalize, cleanLevelName, recordB2F } = FrontendHelper();

  /* ===== SUBMISSION ROW ===== */
  return (
    <tr onClick={ () => onClick(submission) }>

      { /* If isChecked is true, render the action for the submission */ }
      { isChecked && 
        <td>
          <ActionSymbol action={ submission.action } />
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
};

/* ===== EXPORTS ===== */
export default SubmissionRow;