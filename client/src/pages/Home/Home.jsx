/* ===== IMPORTS ===== */
import "./Home.css";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import HomeLogic from "./Home.js";
import NewsPost from "./NewsPost";
import RecentSubmissionsRow from "../../components/RecentSubmissionsRow/RecentSubmissionsRow";

function Home() {
  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { submissions, posts, getSubmissions, getPosts } = HomeLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the home component mounts
  useEffect(() => {
    getSubmissions();
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== HOME COMPONENT ===== */
  return submissions && posts &&
    <div className="home">
      { /* Home Header - Display most general information about the website */ }
      <div className="home-header">
        <h1>Super Monkey Ball Elite</h1>
      </div>

      { /* Home Body - Contains various home page items */ }
      <div className="home-body">

        { /* Recent Submissions - render the 5 most recent submissions in a table */ }
        <div className="home-recent-submissions">
          <h2>Recent Submissions</h2>
          <table>

            { /* Table header: specifies the information displayed in each cell of the table */ }
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
                return <RecentSubmissionsRow submission={ submission } renderGame={ true } key={ submission.id } />
              })}
            </tbody>
            
          </table>
        </div>

        {/* Home posts - render the 3 most recent posts */}
        <div className="home-posts">

          { /* Home posts header - render the header information above the posts */ }
          <div className="home-posts-header">
            <h2><Link to="/news">News</Link></h2>
            <hr />
          </div>

          { /* Home posts body - render each post in the list */ }
          <div className="home-posts-body">
            { posts.map(post => {
              return <NewsPost post={ post } key={ post.id } />;
            })}
          </div>
        </div>

      </div>
    </div>
};

/* ===== EXPORTS ===== */
export default Home;