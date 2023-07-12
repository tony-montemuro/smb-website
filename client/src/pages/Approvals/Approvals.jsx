/* ===== IMPORTS ===== */
import "./Approvals.css";
import { SubmissionContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import ApprovalLogic from "./Approvals.js";
import GameSelect from "../../components/GameSelectList/GameSelectList.jsx";
import SubmissionPopup from "./SubmissionPopup.jsx";
import SubmissionTable from "./SubmissionTable";

function Approvals({ imageReducer }) {
  /* ===== CONTEXTS ===== */

  // submissions state from submission context
  const { submissions } = useContext(SubmissionContext);

  /* ===== STATES & FUNCTIONS ===== */
  const [submission, setSubmission] = useState(null);

  // states & functions from the js file
  const { game, recent, checked, setGame, dispatchRecent, setRecent, setDefaultGame, addToRecent } = ApprovalLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    if (submissions.recent) {
      // first, update the recent state reducer by calling the setRecent function
      setRecent(submissions.recent);

      // next, let's initialize the game state
      setDefaultGame(submissions.recent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions]);

  /* ===== APPROVALS COMPONENT ===== */
  return recent && game ?
    <div className="approvals">

      { /* Game select - Render a column of games to choose from */ }
      <GameSelect recent={ recent } gameAbb={ game } setGameAbb={ setGame } imageReducer={ imageReducer } />
      
      { /* Approvals content - the bulk of this page */ }
      <div className="approvals-content">

        { /* Approvals header - render the header info here. */ }
        <div className="approvals-header">
          <h1>Check New Submissions</h1>
          <p>Please go through and approve or reject each new submission.</p>
        </div>

        { /* Approvals body - render checked & submissions here */ }
        <div className="approvals-body">

          { /* Approvals checked - render the list of checked submissions */ }
          <div className="approvals-checked">

            { /* Checked header - render information regarding the checked list of submissions */ }
            <div className="approvals-checked-header">
              <h2>Checked Submissions</h2>
              <p><b>Note: </b>If you mistakenly added a submission to the list of checked submissions, you can remove it by simply
              clicking the submission.</p>
            </div>

            <SubmissionTable submissions={ checked } onRowClick={ addToRecent } isChecked={ true } />
            <div className="approvals-btn-wrapper">
              <button type="button" disabled={ checked.length === 0 }>Make Changes</button>
            </div>
          </div>

          { /* Approvals new - render the list of new submissions */ }
          <div className="approvals-new">

            { /* Approvals new header - render information about the new submissions list of submissions */ }
            <div className="approvals-new-header">
              <h2>New Submissions</h2>
            </div>
            
            <SubmissionTable submissions={ recent[game] } onRowClick={ setSubmission } isChecked={ false } />
          </div>

        </div>

      </div>
    
    { /* Popup elements */ }
    <SubmissionPopup popup={ submission } setPopup={ setSubmission } abb={ game } dispatchRecent={ dispatchRecent } />

    </div>
  :
    <p>Loading...</p>;
};

/* ===== EXPORTS ===== */
export default Approvals;