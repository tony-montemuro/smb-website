/* ===== IMPORTS ===== */
import { useEffect, useState } from "react";
import LoadingTable from "../LoadingTable/LoadingTable.jsx";
import PageControls from "../PageControls/PageControls.jsx";
import RecentSubmissionsRow from "./RecentSubmissionsRow.jsx";
import RecentSubmissionsTableLogic from "./RecentSubmissionsTable.js";
import TableContent from "../TableContent/TableContent.jsx";

function RecentSubmissionsTable({ renderGame = true, renderLevelContext = true, numSubmissions = 5, searchParams }) {
  /* ===== VARIABLES ===== */
  let NUM_COLS = 4;
  if (renderGame) NUM_COLS += 1;
  if (renderLevelContext) NUM_COLS += 2;

  /* ===== STATES & FUNCTIONS ===== */
  const [pageNum, setPageNum] = useState(1);

  // states and functions from the js file
  const { submissions, fetchRecentSubmissions } = RecentSubmissionsTableLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts OR when the pageNum is updated OR when the searchParams are updated
  useEffect(() => {
    fetchRecentSubmissions(numSubmissions, searchParams ? searchParams : new URLSearchParams(), pageNum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, searchParams]);

  /* ===== RECENT SUBMISSIONS TABLE COMPONENT ===== */
  return (
    <>
      <div className="table">
        <table>

          { /* Table header - render information about what is present in each column */ }
          <thead>
            <tr>
              <th>Submitted</th>
              <th>User</th>
              { renderGame && <th>Game</th> }
              { renderLevelContext && 
                <>
                  <th>Category</th>
                  <th>Chart</th> 
                </>
              }
              <th>Record</th>
              <th>TAS</th>
            </tr>
          </thead>

          { /* Table body - for each submission, render a row in the table */ }
          <tbody>
            { submissions.data ?
              <TableContent items={ submissions.data } emptyMessage="No recent submissions!" numCols={ NUM_COLS }>
                { submissions.data.map(submission => {
                  return (
                    <RecentSubmissionsRow 
                      submission={ submission } 
                      renderGame={ renderGame } 
                      renderLevelContext={ renderLevelContext } 
                      key={ submission.id } 
                    />
                  );
                })}
              </TableContent>
            :
              <LoadingTable numCols={ NUM_COLS } />
            }
          </tbody>

        </table>

      </div>

      {/* Finally, render the page controls at the bottom of the page */}
      <PageControls 
        totalItems={ submissions.total }
        itemsPerPage={ numSubmissions }
        pageNum={ pageNum }
        setPageNum={ setPageNum }
        itemName="Submissions" 
      />
    </>
  );
};

/* ===== EXPORTS ===== */
export default RecentSubmissionsTable;