/* ===== IMPORTS ===== */
import FrontendHelper from "../../helper/FrontendHelper";
import Username from "../../components/Username/Username.jsx"

function SubmissionRow({ submission }) {
  /* ===== VARIABLES ===== */
  const details = submission.details;
  const profile = submission.profile;
  const type = submission.score ? "score" : "time";

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { getTimeAgo, capitalize, cleanLevelName, recordB2F } = FrontendHelper();

  /* ===== SUBMISSION ROW ===== */
  return (
    <div className="approval-submission-row">

      { /* Render how long ago the submission was submitted */ }
      <div className="approval-submission-row-element">
        <div>{ getTimeAgo(details.id) }</div>
      </div>

      { /* Render the username of the person who submitted it */ }
      <div className="approval-submission-row-element">
        <div>
          <Username 
            country={ profile.country } 
            profileId={ profile.id } 
            username={ profile.username } 
          />
        </div>
      </div>

      { /* Render the name of the level, as well as the type of submission */ }
      <div className="approval-submission-row-element">
        <div>
          { `${ cleanLevelName(submission.level.name) } (${ capitalize(type) })` }
        </div>
      </div>

      { /* Render the record */ }
      <div className="approval-submission-row-element">
        <div>{ recordB2F(details.record, type) }</div>
      </div>
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default SubmissionRow;