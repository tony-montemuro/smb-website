/* ===== IMPORTS ===== */
import { ModeratorLayoutContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import styles from "./SubmissionHandler.module.css";
import Container from "../Container/Container.jsx";
import LoadingTable from "../LoadingTable/LoadingTable.jsx";
import Popup from "../Popup/Popup.jsx";
import SimpleGameSelect from "../SimpleGameSelect/SimpleGameSelect.jsx";
import Submission from "./Popups/Submission.jsx";
import SubmissionHandlerLogic from "./SubmissionHandler.js";
import SubmissionRow from "./SubmissionRow";
import TableContent from "../TableContent/TableContent";

function SubmissionHandler({ imageReducer, isUnapproved }) {
  /* ===== VARIABLES ===== */
  const NUM_COLS = isUnapproved ? 5 : 6;

  /* ===== CONTEXTS ===== */

  // games state from modereator layout context
  const { games } = useContext(ModeratorLayoutContext);

  /* ===== STATES & FUNCTIONS ===== */
  const [submission, setSubmission] = useState(undefined);
  const [sortedGames, setSortedGames] = useState(undefined);

  // states & functions from the js file
  const { 
    game,
    submissions,
    setGame,
    setSubmissions,
    fetchSubmissions,
    setGameAndScroll
  } = SubmissionHandlerLogic(isUnapproved);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, when the games state changes, OR when isUnapproved changes
  useEffect(() => {
    if (games) {
      const sorted = isUnapproved ? games.toSorted((a, b) => b.unapproved - a.unapproved) : games.toSorted((a, b) => b.reported - a.reported);
      setSortedGames(sorted);
      setGame(sorted[0]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games, isUnapproved]);

  // code that is executed when the component mounts, OR when the game state changes
  useEffect(() => {
    if (game) {
      fetchSubmissions(game);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  /* ===== SUBMISSION HANDLER COMPONENT ===== */
  return (
    <div className={ styles.submissionHandler }>

      { /* Popup elements */ }
      <Popup renderPopup={ submission } setRenderPopup={ setSubmission } width="1200px">
        <Submission game={ game } isUnapproved={ isUnapproved } setSubmissions={ setSubmissions } />
      </Popup>

      { /* Simple game select - Render a column of games to choose from */ }
      <div className={ styles.left }>
        <SimpleGameSelect
          games={ sortedGames } 
          game={ game } 
          setGame={ setGameAndScroll } 
          imageReducer={ imageReducer } 
          countType={ isUnapproved ? "unapproved" : "reported" }
        />
      </div>
      
      { /* Submission handler content - the bulk of this page */ }
      <div id="content" className={ styles.content }>

        <Container title={ isUnapproved ? "New Submissions" : "Reported Submissions" } largeTitle>
          <p>Please go through and approve or reject each { isUnapproved ? "new" : "reported" } submission.</p>
          <div className="table">
            <table>

              { /* Submission table header - Render the description of what's contained in each row. If the isUnapproved parameter 
              is false, an additional column will be rendered. */ }
              <thead>
                <tr>
                  <th>{ isUnapproved ? "Submitted" : "Reported" }</th>
                  { !isUnapproved && <th>Reported By</th> }
                  <th>User</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Record</th>
                </tr>
              </thead>

              { /* Submission table body - Render information about each submission in submissions array */ }
              <tbody>
                { submissions ?
                  <TableContent 
                    items={ submissions } 
                    emptyMessage={ `This game has no ${ isUnapproved ? "new" : "reported" } submissions.` } 
                    numCols={ NUM_COLS }
                  >
                    { submissions.map(submission => {
                      return <SubmissionRow 
                        submission={ submission } 
                        onClick={ setSubmission }
                        isUnapproved={ isUnapproved }
                        key={ submission.id } 
                      />
                    })}
                  </TableContent>
                :
                  <LoadingTable numCols={ NUM_COLS } />  
                }
              </tbody>

            </table>
          </div>
        </Container>

      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default SubmissionHandler;