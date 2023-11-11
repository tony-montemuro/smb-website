/* ===== IMPORTS ===== */
import { GameContext, MessageContext } from "../../utils/Contexts";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./SubmissionHistory.module.css";
import Container from "../../components/Container/Container.jsx";
import FancyLevel from "../../components/FancyLevel/FancyLevel.jsx";
import FilteredSubmissionRow from "./FilteredSubmissionRow";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import Loading from "../../components/Loading/Loading.jsx";
import LoadingTable from "../../components/LoadingTable/LoadingTable.jsx";
import Popup from "../../components/Popup/Popup.jsx";
import ScrollHelper from "../../helper/ScrollHelper";
import SubmissionDetails from "../../components/SubmissionDetails/SubmissionDetails.jsx";
import SubmissionHistoryLogic from "./SubmissionHistory";
import TableContent from "../../components/TableContent/TableContent.jsx";
import TableTabs from "../../components/TableTabs/TableTabs";
import Username from "../../components/Username/Username";

function SubmissionHistory() {
  /* ===== HELPER FUNCTIONS ====== */
  const { capitalize, runTypeB2F } = FrontendHelper();
  const { fetchLevelFromGame } = GameHelper();
  const { scrollToTop } = ScrollHelper();

  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
	const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const category = path[3];
	const type = path[4];
	const levelName = path[5];
  const profileId = path[6];
  const runTypeParam = path[7];
  const TABLE_WIDTH = 11;
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
      // first, let's fetch data based on path
      const [level, profile] = await Promise.all(
        [fetchLevelFromGame(game, levelName, category, type), fetchProfile(profileId)]
      );
			
			// if no level or profile exists, we will print an error message, and navigate to the home screen
			if (!level || profile === null) {
				addMessage("Submission History does not exist.", "error", 5000);
				navigate(level ? `/games/${ abb }/${ category }/${ type }/${ levelName }` : `/games/${ abb }`);
				return;
			}

      // update the state hook for level and profile
      setLevel(level);
      setProfile(profile);
			
      // finally, given information about the path, fetch submissions for this page
			fetchSubmissions();
    }

    validatePath();
    scrollToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // code that is executed each time the path changes
  useEffect(() => {
    setRunType(runTypeParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ===== RECORD HISTORY COMPONENT ===== */
  return (
    <>
      { /* Popups */ }
      <Popup renderPopup={ detailSubmission } setRenderPopup={ setDetailSubmission } width="800px" >
				<SubmissionDetails level={ level } updateBoard={ fetchSubmissions } />
			</Popup>

      <Container title="Submission History" largeTitle>
        <div className={ styles.containerBody }>
        { profile ?

          // Header - render message describing the page
          <h2>
            The following is the list of all submissions by&nbsp;
            <>
              <Username profile={ profile } />
              &nbsp;to&nbsp;
              <Link to={ `/games/${ abb }/${ category }/${ type }/${ levelName }` }>
                <FancyLevel level={ levelName } size="medium" /> ({ capitalize(type) })
              </Link>:
            </>
          </h2>

          :
            <Loading />
          }

          {/* Body - The actual content of the page: tabs to swap between normal & TAS, & a table of submissions */}
          <div>
            { submissions[runType] && <TableTabs elements={ tableTabElements } current={ runType } handleClick={ handleTabClick } /> }
            <div className="table">
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
                  { submissions[runType] ?
                    <TableContent items={ submissions[runType] } emptyMessage={ `This user has never submitted ${ runTypeB2F(runType) } runs to this chart.` } numCols={ TABLE_WIDTH }>
                      { submissions[runType].map(submission => {
                        return <FilteredSubmissionRow 
                          submission={ submission }
                          level={ level }
                          onClickFunc={ setDetailSubmission }
                          key={ submission.id }
                        />;
                      })}
                    </TableContent>
                  :
                    <LoadingTable numCols={ TABLE_WIDTH } />
                  }
                </tbody>

              </table>
            </div>
          </div>

        </div>
      </Container>

    </>
  );
};

/* ===== EXPORTS ===== */
export default SubmissionHistory;