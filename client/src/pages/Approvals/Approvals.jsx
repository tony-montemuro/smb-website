/* ===== IMPORTS ===== */
import "./Approvals.css";
import { SubmissionContext } from "../../utils/Contexts";
import { useContext } from "react";
import ApprovalLogic from "./Approvals.js";

function Approvals() {
  /* ===== CONTEXTS ===== */

  // submissions state from submission context
  const { submissions } = useContext(SubmissionContext);

  /* ===== APPROVALS COMPONENT ===== */
  return (
    <div className="approvals">
      <h1>Approvals</h1>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Approvals;