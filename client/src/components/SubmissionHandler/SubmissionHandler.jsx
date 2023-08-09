/* ===== IMPORTS ===== */
import "./SubmissionHandler.css";
import { SubmissionContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import GameSelectList from "./GameSelectList.jsx";
import SubmissionHandlerLogic from "./SubmissionHandler.js";
import SubmissionPopup from "./SubmissionPopup.jsx";
import SubmissionTable from "./SubmissionTable";

function SubmissionHandler({ imageReducer, isNew }) {
  /* ===== CONTEXTS ===== */

  // submissions state from submission context
  const { submissions } = useContext(SubmissionContext);

  /* ===== STATES & FUNCTIONS ===== */
  const [submission, setSubmission] = useState(null);

  // states & functions from the js file
  const { 
    game, 
    recent, 
    checked, 
    setGame, 
    dispatchRecent, 
    setRecent, 
    setDefaultGame, 
    addToRecent,
    handleChanges
  } = SubmissionHandlerLogic(isNew);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    if (submissions.recent && submissions.reported) {
      // first, update the recent state reducer by calling the setRecent function
      setRecent(isNew ? submissions.recent : submissions.reported);

      // next, let's initialize the game state
      setDefaultGame(isNew ? submissions.recent : submissions.reported);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions]);

  /* ===== SUBMISSION HANDLER COMPONENT ===== */
  return recent && game ?
    <div className="submission-handler">

      { /* Game select - Render a column of games to choose from */ }
      <GameSelectList recent={ recent } gameAbb={ game } setGameAbb={ setGame } imageReducer={ imageReducer } />
      
      { /* Submission handler content - the bulk of this page */ }
      <div className="submission-handler-content">

        { /* Submission handler header - render the header info here. */ }
        <div className="submission-handler-header">
          <h1>Check { isNew ? "New" : "Reported" } Submissions</h1>
          <p>Please go through and approve or reject each { isNew ? "new" : "reported" } submission.</p>
        </div>

        { /* Submission handler body - render checked & submissions here */ }
        <div className="submission-handler-body">

          { /* Submission handler checked - render the list of checked submissions */ }
          <div className="submission-handler-checked">

            { /* Checked header - render information regarding the checked list of submissions */ }
            <div className="submission-handler-checked-header">
              <h2>Checked Submissions</h2>
              <p><b>Note: </b>If you mistakenly added a submission to the list of checked submissions, you can remove it by simply
              clicking the submission.</p>
            </div>

            { /* Submission table - render the "checked" submissions */ }
            <SubmissionTable submissions={ checked } onRowClick={ addToRecent } isChecked={ true } isNew={ isNew } />

            { /* Submission handler button - when pressed, all actions will actually perform */ }
            <div className="submission-handler-btn-wrapper">
              <button type="button" disabled={ checked.length === 0 } onClick={ () => handleChanges(checked) }>Make Changes</button>
            </div>

          </div>

          { /* Submission handler new - render the list of new submissions */ }
          <div className="submission-handler-new">

            { /* Submissions handler new header - render information about the new (or reported) submissions list of submissions */ }
            <div className="submission-handler-new-header">
              <h2>{ isNew ? "New" : "Reported" } Submissions</h2>
            </div>

            { /* Submission table - render the recent (unchecked) submissions */ }
            <SubmissionTable submissions={ recent[game] } onRowClick={ setSubmission } isChecked={ false } isNew={ isNew } />

          </div>

        </div>

      </div>
    
    { /* Popup elements */ }
    <SubmissionPopup popup={ submission } setPopup={ setSubmission } abb={ game } dispatchRecent={ dispatchRecent } isNew={ isNew } />

    </div>
  :
    <p>Loading...</p>;
};

/* ===== EXPORTS ===== */
export default SubmissionHandler;