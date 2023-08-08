/* ===== IMPORTS ===== */
import ApprovalLogic from "./Approvals.js";
import SubmissionHandler from "../../components/SubmissionHandler/SubmissionHandler.jsx";

function Approvals({ imageReducer }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { handleChanges } = ApprovalLogic();

  /* ===== APPROVALS COMPONENT ===== */
  return <SubmissionHandler imageReducer={ imageReducer } isNew={ true } handleChanges={ handleChanges } />;
};

/* ===== EXPORTS ===== */
export default Approvals;