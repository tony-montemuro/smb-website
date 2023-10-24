/* ===== IMPORTS ===== */
import SubmissionHandler from "../../components/SubmissionHandler/SubmissionHandler.jsx";

function Approvals({ imageReducer }) {
  /* ===== APPROVALS COMPONENT ===== */
  return <SubmissionHandler imageReducer={ imageReducer } isUnapproved />;
};

/* ===== EXPORTS ===== */
export default Approvals;