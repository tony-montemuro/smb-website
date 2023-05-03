/* ===== IMPORTS ===== */
import "./RecordHistory.css";
import { Link } from "react-router-dom";
import { StaticCacheContext } from "../../Contexts";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FilteredSubmissionRow from "./FilteredSubmissionRow";
import FrontendHelper from "../../helper/FrontendHelper";
import PathHelper from "../../helper/PathHelper";
import RecordHistoryLogic from "./RecordHistory";
import Username from "../../components/Username/Username";

function RecordHistory() {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
	const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const category = path[3];
	const type = path[4];
	const levelName = path[5];
  const userId = path[6];
  const TABLE_WIDTH = 10;

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES & FUNCTIONS ====== */
  const [user, setUser] = useState(undefined);

  // states and functions from the js file
  const { capitalize, cleanLevelName } = FrontendHelper();
  const { submissions, getSubmissions } = RecordHistoryLogic();
  const { fetchLevelFromGame } = PathHelper();

  /* ===== EFFECTS ====== */

  // code that is executed when the component mounts, & when the static cache object is updated
  useEffect(() => {
    // cache variables
    const games = staticCache.games;
    const profiles = staticCache.profiles;
    
		if (games.length > 0 && profiles.length > 0) {
			// see if abb corresponds to a game stored in cache
			const game = games.find(row => row.abb === abb);

			// if not, we will print an error message, and navigate to the home screen
			if (!game) {
				console.log("Error: Invalid game.");
				navigate("/");
				return;
			}

			// see if levelName corresponds to a level stored in the game array
			const level = fetchLevelFromGame(game, levelName, category);
			
			// if not, we will print an error message, and navigate to the home screen
			if (!level) {
				console.log("Error: Invalid level.");
				navigate("/");
				return;
			}

      // see if the userId corresponds to a profile stored in the profiles array
      const user = profiles.find(row => row.id === userId);

      // if not, we will print an error message, and navigate to the home screen
			if (!user) {
				console.log("Error: Invalid user.");
				navigate("/");
				return;
			}

			// update state hook for user
      setUser(user);
			
      // finally, given information about the path, fetch submissions for this page
			getSubmissions(abb, levelName, userId, type);
		}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache]);

  /* ===== RECORD HISTORY COMPONENT ===== */
  return submissions &&
    <>

      { /* Record History Header - Render information about the page. */ }
      <div className="record-history-header">
        <h1>Submission History</h1>

        { /* Render a custom message, depending on the path. */ }
        <div>
          The following is the list of all submissions by&nbsp;
          <>
            <Username country={ user.country ? user.country.iso2 : null } userId={ user.id } username={ user.username } />
            &nbsp;to&nbsp;
            <Link to={ `/games/${ abb }/${ category }/${ type }/${ levelName }` }>{ cleanLevelName(levelName) } ({ capitalize(type) })</Link>:
          </>
        </div>

      </div>

      { /* Record History Body - The actual content of the page: a table of submissions */ }
      <div className="record-history-body">
        <table>

          { /* Table header: specifies the information displayed in each cell of the table */ }
          <thead>
            <tr>
              <th>Submitted</th>
              <th>{ capitalize(type) }</th>
              <th>Date</th>
              <th>Region</th>
              <th>Monkey</th>
              <th>Proof</th>
              <th>Comment</th>
              <th>Live</th>
              <th>Position</th>
              <th>All Position</th>
            </tr>
          </thead>

          { /* Table body - the actual content itself, rendered row by row given submission data */ }
          <tbody>
            { submissions.length > 0 ?
              // If any submissions exist, render them using the submission data.
              submissions.map(submission => {
                return <FilteredSubmissionRow submission={ submission } key={ submission.id } />;
              })
            :
              // Otherwise, render a message to the client stating that the user specified in the path has not submitted to the level.
              <tr>
                <td className="record-history-empty" colSpan={ TABLE_WIDTH }><i>This user has never submitted to this chart.</i></td>
              </tr>
            }
          </tbody>

        </table>
      </div>
    </>
   
  ;
};

/* ===== EXPORTS ===== */
export default RecordHistory;