/* ===== IMPORTS ===== */
import "./SubmissionHistory.css";
import { GameContext, MessageContext, StaticCacheContext } from "../../utils/Contexts";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DetailPopup from "../../components/DetailPopup/DetailPopup.jsx";
import FilteredSubmissionRow from "./FilteredSubmissionRow";
import FrontendHelper from "../../helper/FrontendHelper";
import PathHelper from "../../helper/PathHelper";
import SubmissionHistoryLogic from "./SubmissionHistory";
import Username from "../../components/Username/Username";
import TableTabs from "../../components/TableTabs/TableTabs";

function SubmissionHistory() {
  /* ===== HELPER FUNCTIONS ====== */
  const { capitalize, cleanLevelName, runTypeB2F } = FrontendHelper();
  const { fetchLevelFromGame } = PathHelper();

  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
	const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const category = path[3];
	const type = path[4];
	const levelName = path[5];
  const profileId = path[6];
  const TABLE_WIDTH = 12;
  const tableTabElements = [{ data: "normal", renderedData: runTypeB2F("normal")}, { data: "tas", renderedData: runTypeB2F("tas") }];

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  // game state from game context
  const { game } = useContext(GameContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES & FUNCTIONS ====== */
  const [detailSubmission, setDetailSubmission] = useState(undefined);
  const [level, setLevel] = useState(undefined);
  const [profile, setProfile] = useState(undefined);

  // states and functions from the js file
  const { 
    submissions,
    runType,
    setRunType,
    fetchSubmissions,
    handleTabClick
  } = SubmissionHistoryLogic();

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

      // update the state hook for level
      setLevel(level);

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
			fetchSubmissions();
		}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache]);

  // code that is executed each time the path changes
  useEffect(() => {
    setRunType(path[7]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ===== RECORD HISTORY COMPONENT ===== */
  return profile && submissions[runType] &&
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

      { /* Record History Body - The actual content of the page: tabs to swap between normal & TAS, & a table of submissions */ }
      <div className="submission-history-body">

        { /* Render both the "normal" and "tas" tabs */ }
        <div className="submission-history-options">
          <TableTabs elements={ tableTabElements } current={ runType } handleClick={ handleTabClick } />
        </div>
        
        { /* Render the submission history table */ }
        <div className="submission-history-table">
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
              </tr>
            </thead>

            { /* Table body - the actual content itself, rendered row by row given submission data */ }
            <tbody>
              { submissions[runType].length > 0 ?

                // If any submissions exist, render them using the submission data.
                submissions[runType].map(submission => {
                  return <FilteredSubmissionRow 
                    submission={ submission }
                    level={ level }
                    onClickFunc={ setDetailSubmission }
                    key={ submission.id }
                  />;
                })

              :

                // Otherwise, render a message to the client stating that the user specified in the path has not submitted to the level.
                <tr>
                  <td id="submission-history-empty" colSpan={ TABLE_WIDTH }><i>This user has never submitted { runTypeB2F(runType) } runs to this chart.</i></td>
                </tr>

              }
            </tbody>

          </table>
        </div>
      </div>

      { /* Detail popup */ }
      <DetailPopup 
        submission={ detailSubmission } 
        setSubmission={ setDetailSubmission } 
        level={ level }
      />
    </>
   
  ;
};

/* ===== EXPORTS ===== */
export default SubmissionHistory;