/* ===== IMPORTS ===== */
import SubmissionHandler from "../../components/SubmissionHandler/SubmissionHandler.jsx";

function Reports({ imageReducer }) {
  /* ===== REPORTS COMPONENT ===== */
  return <SubmissionHandler imageReducer={ imageReducer } isNew={ false } />;
};

/* ===== EXPORTS ===== */
export default Reports;