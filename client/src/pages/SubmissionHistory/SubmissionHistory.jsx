/* ===== IMPORTS ===== */
import "./SubmissionHistory.css";
import { GameContext, MessageContext, StaticCacheContext, UserContext } from "../../utils/Contexts";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DetailPopup from "./DetailPopup";
import FilteredSubmissionRow from "./FilteredSubmissionRow";
import FrontendHelper from "../../helper/FrontendHelper";
import PathHelper from "../../helper/PathHelper";
import SubmissionHistoryLogic from "./SubmissionHistory";
import Username from "../../components/Username/Username";

function SubmissionHistory({ submissionCache }) {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
	const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const category = path[3];
	const type = path[4];
	const levelName = path[5];
  const profileId = path[6];
  const TABLE_WIDTH = 10;

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  // user state from user context
  const { user } = useContext(UserContext);

  // game state from game context
  const { game } = useContext(GameContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES & FUNCTIONS ====== */

  // states
  const [detailSubmission, setDetailSubmission] = useState(undefined);

  // states and functions from the js file
  const { 
    submissions,
    profile, 
    setProfile, 
    fetchSubmissions
  } = SubmissionHistoryLogic();

  // helper functions
  const { capitalize, cleanLevelName } = FrontendHelper();
  const { fetchLevelFromGame } = PathHelper();

  /* ===== EFFECTS ====== */

  // code that is executed when the component mounts, & when the static cache object is updated
  useEffect(() => {
    // cache variables
    const profiles = staticCache.profiles;
    
		if (profiles.length > 0) {
			// see if levelName corresponds to a level stored in the game array
			const level = fetchLevelFromGame(game, levelName, category, type);
			
			// if not, we will print an error message, and navigate to the home screen
			if (!level) {
				addMessage("Level does not exist.", "error");
				navigate("/");
				return;
			}

      // see if the profileId corresponds to a profile stored in the profiles array
      const profile = profiles.find(row => row.id === parseInt(profileId));

      // if not, we will print an error message, and navigate to the home screen
			if (!profile) {
				addMessage("User does not exist.", "error");
				navigate("/");
				return;
			}

			// update state hook for profile
      setProfile(profile);
			
      // finally, given information about the path, fetch submissions for this page
			fetchSubmissions(submissionCache);
		}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache]);

  /* ===== RECORD HISTORY COMPONENT ===== */
  return profile && submissions &&
    <>

      { /* Record History Header - Render information about the page. */ }
      <div className="submission-history-header">
        <h1>Submission History</h1>

        { /* Render a custom message, depending on the path. */ }
        <div>
          The following is the list of all submissions by&nbsp;
          <>
            <Username country={ profile.country ? profile.country.iso2 : null } profileId={ profile.id } username={ profile.username } />
            &nbsp;to&nbsp;
            <Link to={ `/games/${ abb }/${ category }/${ type }/${ levelName }` }>{ cleanLevelName(levelName) } ({ capitalize(type) })</Link>:
          </>
        </div>
      </div>

      { /* Record History Body - The actual content of the page: a table of submissions */ }
      <div className="submission-history-body">
        <table>

          { /* Table header: specifies the information displayed in each cell of the table */ }
          <thead>
            <tr>
              <th>Date</th>
              <th>Submitted</th>
              <th>{ capitalize(type) }</th>
              <th>Monkey</th>
              <th>Platform</th>
              <th>Region</th>
              <th></th>
              <th></th>
              <th></th>
              <th>Position</th>
              <th>Live Position</th>
              <th></th>
            </tr>
          </thead>

          { /* Table body - the actual content itself, rendered row by row given submission data */ }
          <tbody>
            { submissions.length > 0 ?

              // If any submissions exist, render them using the submission data.
              submissions.map(submission => {
                return <FilteredSubmissionRow 
                  submission={ submission }
                  onClickFunc={ setDetailSubmission }
                  key={ submission.id }
                />;
              })

            :

              // Otherwise, render a message to the client stating that the user specified in the path has not submitted to the level.
              <tr>
                <td className="submission-history-empty" colSpan={ user.is_mod ? TABLE_WIDTH+1 : TABLE_WIDTH }><i>This user has never submitted to this chart.</i></td>
              </tr>

            }
          </tbody>

        </table>
      </div>

      { /* Detail popup */ }
      <DetailPopup submission={ detailSubmission } setSubmission={ setDetailSubmission } profile={ profile } />
    </>
   
  ;
};

/* ===== EXPORTS ===== */
export default SubmissionHistory;