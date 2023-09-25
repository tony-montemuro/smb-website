/* ===== IMPORTS ===== */
import "./RecentSubmissionsTable.css";
import { useEffect, useState } from "react";
import PageControls from "../PageControls/PageControls.jsx";
import RecentSubmissionsRow from "./RecentSubmissionsRow.jsx";
import RecentSubmissionsTableLogic from "./RecentSubmissionsTable.js";

function RecentSubmissionsTable({ renderGame = true, numSubmissions = 5, searchParams = new URLSearchParams() }) {
  /* ===== STATES & FUNCTIONS ===== */
  const [pageNum, setPageNum] = useState(1);

  // states and functions from the js file
  const { submissions, fetchRecentSubmissions } = RecentSubmissionsTableLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the searchParams are updated
  useEffect(() => {
    fetchRecentSubmissions(numSubmissions, searchParams, pageNum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, searchParams]);

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
          { submissions.data.map(submission => {
            return <RecentSubmissionsRow submission={ submission } renderGame={ renderGame } key={ submission.id } />;
          })}
        </tbody>

      </table>

      {/* Finally, render the page controls at the bottom of the page */}
      <PageControls 
        totalItems={ submissions.total }
        itemsPerPage={ numSubmissions }
        pageNum={ pageNum }
        setPageNum={ setPageNum }
        itemName={ "Submissions" } 
      />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default RecentSubmissionsTable;