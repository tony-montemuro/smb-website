/* ===== IMPORTS ===== */
import ReportLogic from "./Reports.js";
import SubmissionHandler from "../../components/SubmissionHandler/SubmissionHandler.jsx";

function Reports({ imageReducer }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { handleChanges } = ReportLogic();

  /* ===== REPORTS COMPONENT ===== */
  return <SubmissionHandler imageReducer={ imageReducer } isNew={ false } handleChanges={ handleChanges } />;
};

/* ===== EXPORTS ===== */
export default Reports;