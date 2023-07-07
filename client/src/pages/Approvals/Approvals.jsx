/* ===== IMPORTS ===== */
import "./Approvals.css";
import { SubmissionContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import ApprovalLogic from "./Approvals.js";
import GameSelect from "../../components/GameSelect/GameSelect";
import SubmissionRow from "./SubmissionRow";

function Approvals({ imageReducer }) {
  /* ===== CONTEXTS ===== */

  // submissions state from submission context
  const { submissions } = useContext(SubmissionContext);

  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { game, recent, setGame, setRecent, setDefaultGame } = ApprovalLogic();

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
          <h1>Approve Submissions</h1>
          <p>Please go through the new submissions listed below. You can either <b>Approve</b> the submission, or <b>Delete</b> it.</p>
        </div>

        { /* Approvals body - render new submissions here */ }
        <div className="approvals-body">
          <h2>New Submissions</h2>
          { recent[game].map(submission => {
            return <SubmissionRow submission={ submission } key={ submission.details.id } />
          })}
        </div>

      </div>
    
    </div>
  :
    <p>Loading...</p>;
};

/* ===== EXPORTS ===== */
export default Approvals;