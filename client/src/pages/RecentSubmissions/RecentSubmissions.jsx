/* ===== IMPORTS ===== */
import "./RecentSubmissions.css";
import { useSearchParams } from "react-router-dom";
import RecentSubmissionsTable from "../../components/RecentSubmissionsTable/RecentSubmissionsTable.jsx";

function RecentSubmissions() {
  /* ===== VARIABLES ===== */
  const NUM_SUBMISSIONS = 20;

  /* ===== STATES ===== */
  const [searchParams, setSearchParams] = useSearchParams();

  /* ===== RECENT SUBMISSIONS COMPONENT ===== */
  return (
    <div className="recent-submissions">
      <h1>Recent Submissions</h1>
      <RecentSubmissionsTable numSubmissions={ NUM_SUBMISSIONS } searchParams={ searchParams } />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default RecentSubmissions;