/* ===== IMPORTS ===== */
import "./SubmissionHistory.css";
import { GameContext, MessageContext } from "../../utils/Contexts";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FilteredSubmissionRow from "./FilteredSubmissionRow";
import FrontendHelper from "../../helper/FrontendHelper";
import PathHelper from "../../helper/PathHelper";
import Popup from "../../components/Popup/Popup.jsx";
import SubmissionDetails from "../../components/DetailPopup/SubmissionDetails.jsx";
import SubmissionHistoryLogic from "./SubmissionHistory";
import TableTabs from "../../components/TableTabs/TableTabs";
import Username from "../../components/Username/Username";

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

  // game state from game context
  const { game } = useContext(GameContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES & FUNCTIONS ====== */

  // states
  const [level, setLevel] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  const [detailSubmission, setDetailSubmission] = useState(undefined);

  // states and functions from the js file
  const { submissions, runType, setRunType, fetchProfile, fetchSubmissions, handleTabClick } = SubmissionHistoryLogic();

  /* ===== EFFECTS ====== */

  // code that is executed when the component mounts
  useEffect(() => {
    async function validatePath() {
      // first, find level that corresponds with path
      const level = fetchLevelFromGame(game, levelName, category, type);
			
			// if no level exists, we will print an error message, and navigate to the home screen
			if (!level) {
				addMessage("Level does not exist.", "error");
				navigate("/");
				return;
			}

      // update the state hook for level
      setLevel(level);

      // see if the profileId corresponds to a profile in the db
      const profile = await fetchProfile(profileId);

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

    validatePath();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // code that is executed each time the path changes
  useEffect(() => {
    setRunType(path[7]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ===== RECORD HISTORY COMPONENT ===== */
  return profile && submissions[runType] &&
    <>

      { /* Popups */ }
      <Popup renderPopup={ detailSubmission } setRenderPopup={ setDetailSubmission } width={ "40%" } >
				<SubmissionDetails level={ level } updateBoard={ fetchSubmissions } />
			</Popup>

      { /* Record History Header - Render information about the page. */ }
      <div className="submission-history-header">
        <h1>Submission History</h1>

        { /* Render a custom message, depending on the path. */ }
        <div>
          The following is the list of all submissions by&nbsp;
          <>
            <Username profile={ profile } />
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
    </>
   
  ;
};

/* ===== EXPORTS ===== */
export default SubmissionHistory;