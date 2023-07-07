/* ===== IMPORTS ===== */
import "./Approvals.css";
import { SubmissionContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import ApprovalLogic from "./Approvals.js";
import FrontendHelper from "../../helper/FrontendHelper";
import GameSelect from "../../components/GameSelect/GameSelect";

function Approvals({ imageReducer }) {
  /* ===== CONTEXTS ===== */

  // submissions state from submission context
  const { submissions } = useContext(SubmissionContext);

  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { game, recent, setGame, setRecent, setDefaultGame } = ApprovalLogic();

  // helper functions
  const { recordB2F } = FrontendHelper();

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

      <div className="approvals-content">
        { /* Approvals header - render the header info here. */ }
        <div className="approvals-header">
          <h1>New Submissions</h1>
          <p>Please go through the new submissions listed below. You can either <b>Approve</b> the submission, or <b>Delete</b> it.</p>
        </div>

        { /* Approvals body - render new submissions here */ }
        <div className="approvals-body">
          { recent[game].map(submission => {
            return <p key={ submission.details.id }>{ recordB2F(submission.details.record, submission.score ? "score" : "time") }</p>
          })}
        </div>
      </div>
    </div>
  :
    <p>Loading...</p>;
};

/* ===== EXPORTS ===== */
export default Approvals;