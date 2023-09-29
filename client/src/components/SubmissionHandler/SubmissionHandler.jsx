/* ===== IMPORTS ===== */
import "./SubmissionHandler.css";
import { ModeratorLayoutContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import Popup from "../Popup/Popup.jsx";
import SimpleGameSelect from "../SimpleGameSelect/SimpleGameSelect.jsx";
import Submission from "./Submission.jsx";
import SubmissionHandlerLogic from "./SubmissionHandler.js";
import SubmissionRow from "./SubmissionRow";

function SubmissionHandler({ imageReducer, isUnapproved }) {
  /* ===== VARIABLES ===== */
  const NUM_COLS = isUnapproved ? 5 : 6;

  /* ===== CONTEXTS ===== */

  // games state from modereator layout context
  const { games } = useContext(ModeratorLayoutContext);

  /* ===== STATES & FUNCTIONS ===== */
  const [submission, setSubmission] = useState(undefined);
  const [game, setGame] = useState(undefined);
  const [sortedGames, setSortedGames] = useState(undefined);

  // states & functions from the js file
  const { 
    submissions,
    setSubmissions,
    fetchSubmissions,
    isClickable
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
      fetchSubmissions(game.abb);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  /* ===== SUBMISSION HANDLER COMPONENT ===== */
  return game && submissions ?
    <div className="submission-handler">

      { /* Popup elements */ }
      <Popup renderPopup={ submission } setRenderPopup={ setSubmission } width={ "70%" }>
        <Submission submission={ submission } game={ game } isUnapproved={ isUnapproved } setSubmissions={ setSubmissions } />
      </Popup>

      { /* Simple game select - Render a column of games to choose from */ }
      <SimpleGameSelect 
        games={ sortedGames } 
        game={ game } 
        setGame={ setGame } 
        imageReducer={ imageReducer } 
        countType={ isUnapproved ? "unapproved" : "reported" }
      />
      
      { /* Submission handler content - the bulk of this page */ }
      <div className="submission-handler-content">

        { /* Submission handler header - render the header info here. */ }
        <div className="submission-handler-header">
          <h1>Check { isUnapproved ? "New" : "Reported" } Submissions</h1>
          <p>Please go through and approve or reject each { isUnapproved ? "new" : "reported" } submission.</p>
        </div>

        { /* Submission handler body - render checked & submissions here */ }
        <div className="submission-handler-body">

          { /* Submission handler new - render the list of new submissions */ }
          <div className="submission-handler-new">

            { /* Submission table - render the unapproved / reported submissions here */ }

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
                { submissions.length > 0 ?
                  // If any submissions exist, render a submission row for each submission in the array.
                  submissions.map(submission => {
                    return <SubmissionRow 
                      submission={ submission } 
                      onClick={ isClickable(submission) ? setSubmission : null }
                      isUnapproved={ isUnapproved }
                      key={ submission.id } 
                    />
                  })

                :
                  // Otherwise, render a message to the user.
                  <tr className="submission-handler-empty-row">
                    <td colSpan={ NUM_COLS }>
                      <i>This game has no { isUnapproved ? "new" : "reported" } submissions.</i>
                    </td>
                  </tr>

                }
              </tbody>
            </table>

          </div>

        </div>

      </div>

    </div>
  :
    <p>Loading...</p>;
};

/* ===== EXPORTS ===== */
export default SubmissionHandler;