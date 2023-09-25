/* ===== IMPORTS ===== */
import "./RecentSubmissionsTable.css";
import { useEffect } from "react";
import RecentSubmissionsRow from "./RecentSubmissionsRow.jsx";
import RecentSubmissionsTableLogic from "./RecentSubmissionsTable.js";

function RecentSubmissionsTable({ renderGame = true, numRows = 5, searchParams = new URLSearchParams() }) {
  /* ===== STATES & FUNCTIONS ===== */
  const { submissions, total, fetchRecentSubmissions } = RecentSubmissionsTableLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the searchParams are updated
  useEffect(() => {
    fetchRecentSubmissions(numRows, searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* ===== RECENT SUBMISSIONS TABLE COMPONENT ===== */
  return (
    <div className="recent-submissions-table">
      <table>

        { /* Table header - render information about what is present in each column */ }
        <thead>
          <tr>
            <th>Submitted</th>
            <th>User</th>
            { renderGame && <th>Game</th> }
            <th>Category</th>
            <th>Chart</th>
            <th>Record</th>
            <th>TAS</th>
          </tr>
        </thead>

        { /* Table body - for each submission, render a row in the table */ }
        <tbody>
          { submissions.map(submission => {
            return <RecentSubmissionsRow submission={ submission } renderGame={ renderGame } key={ submission.id } />;
          })}
        </tbody>

      </table>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default RecentSubmissionsTable;