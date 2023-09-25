/* ===== IMPORTS ===== */
import "./RecentSubmissions.css";
import { useSearchParams } from "react-router-dom";
import RecentSubmissionsTable from "../../components/RecentSubmissionsTable/RecentSubmissionsTable.jsx";

function RecentSubmissions() {
  /* ===== VARIABLES ===== */
  const NUM_ROWS = 100;

  /* ===== STATES ===== */
  const [searchParams, setSearchParams] = useSearchParams();

  /* ===== RECENT SUBMISSIONS COMPONENT ===== */
  return (
    <div className="recent-submissions">
      <h1>Recent Submissions</h1>
      <RecentSubmissionsTable numRows={ NUM_ROWS } searchParams={ searchParams } />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default RecentSubmissions;