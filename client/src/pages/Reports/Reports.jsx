/* ===== IMPORTS ===== */
import "./Reports.css";
import { SubmissionContext } from "../../utils/Contexts";
import { useContext } from "react";
import ReportLogic from "./Reports.js";

function Reports() {
  /* ===== CONTEXTS ===== */

  // submissions state from submissions context
  const { submissions } = useContext(SubmissionContext);

  /* ===== REPORTS COMPONENT ===== */
  return (
    <div className="reports">
      <h1>Reports</h1>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Reports;