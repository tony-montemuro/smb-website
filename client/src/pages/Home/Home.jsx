/* ===== IMPORTS ===== */
import "./Home.css";
import { useEffect } from "react";
import HomeLogic from "./Home.js";
import RecentSubmissionRow from "./RecentSubmissionRow";

function Home() {
  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { submissions, getSubmissions } = HomeLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the home component mounts
  useEffect(() => {
    getSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== HOME COMPONENT ===== */
  return submissions &&
    <>
      { /* Home Header - Display most general information about the website */ }
      <div className="home-header">
        <h1>Welcome to SMBElite!</h1>
        <i>The website for all things Monkey Ball ILs</i>
      </div>

      { /* Home Body - Contains various home page items */ }
      <div className="home-body">

        { /* Recent Submissions - render the 5 most recent submissions in a table */ }
        <div className="home-recent-submissions">
          <h2>Recent Submissions</h2>
          <table>

            { /* Table header: specifies the information displayed in each cell of the table*/ }
            <thead>
              <tr>
                <th>Submitted</th>
                <th>User</th>
                <th>Game</th>
                <th>Level</th>
                <th>Type</th>
                <th>Record</th>
                <th>Position</th>
              </tr>
            </thead>

            { /* Table body - the actual content itself, rendered row by row given submission data */ }
            <tbody>
              { submissions.map((submission) => {
                return <RecentSubmissionRow submission={ submission } key={ submission.id } />
              })}
            </tbody>
          </table>
        </div>

      </div>
    </>
};

/* ===== EXPORTS ===== */
export default Home;