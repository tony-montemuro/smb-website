/* ===== IMPORTS ===== */
import "./Submissions.css";
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import BoxArt from "../../components/BoxArt/BoxArt.jsx";
import SubmissionsLogic from "./Submissions.js";
import SubmissionsTable from "./SubmissionsTable.jsx";
import { MessageContext, StaticCacheContext, UserContext } from "../../Contexts";

function Submissions({ imageReducer, submissionReducer }) {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== FUNCTIONS ===== */

  // states and functions from the init file
  const { 
    submissions, 
    selectedGame, 
    approved,
    approving,
    swapGame,
    addToApproved,
    removeFromApproved,
    approveAll
  } = SubmissionsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, or when cache fields are updated
  useEffect(() => {
    if (staticCache.games.length > 0 && user.id !== undefined) {
      // ensure current user is a moderator
      const isMod = user && user.is_mod;

      // if not, let's log an error, navigate back to the homepage, and return early
      if (!isMod) {
        addMessage("Forbidden access.", "error");
        navigate("/");
        return;
      }

      // if we have made it this far, we can go ahead and load the first game in cache
      swapGame(staticCache.games[0].abb, submissionReducer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache, user]);

  /* ===== SUBMISSIONS COMPONENT [ONLY loads for moderators] ===== */
  return user.is_mod &&
    <div className="submissions">
      { /* Submissions select: Allows moderator to select a game. Only render the game selector when games are loaded into cache, 
      and the game state is defined */ }
      { staticCache.games.length > 0 && selectedGame && 
        <div className="submissions-select">
          <div className="submissions-tabs">
            { staticCache.games.map(game => {
              return <div
                className={ `submissions-tab ${ game.abb === selectedGame ? "submissions-tab-active" : "" }` }
                onClick={ () => swapGame(game.abb, submissionReducer) }
                key={ game.abb }
              >
                <BoxArt game={ game } imageReducer={ imageReducer } width={ 50 } />
                <span>{ game.name }</span>
              </div>
            })}
          </div>
        </div>
      }

      { /* Submissions content - Includes the header and boy content for the submissinos page. */ }
      <div className="submissions-content">
      
        { /* Submissions header - introduce moderator to the page */ }
        <div className="submissions-header">

          { /* Header - display the title of the page */ }
          <h1>Recent Submissions</h1>

          { /* Brief introduction to the page */ }
          <p><i>Below is the list of recent submissions. Please go through and review each submission for each game.</i></p>

          { /* Instructions on how to operate this page. */ }
          <p>
            To select a game, use the game selection tool on the <b>left</b>.
          </p>
          <p>
            If a submission is <b>valid</b>, add it to the list of approved records by selecting the submission.
            In order to finalize the approval process, you <i>must</i> press the <b>Approve All</b> button under the&nbsp;
            <b>Approved Submissions</b> list. Remember, if you accidently add an invalid run to the <b>Approved Submissions</b>
            &nbsp;list, you can always remove it by selecting the submission.
          </p>
          <p>
            If you suspect a submission is <b>invalid</b>, first navigate to the board with the invalid submission by clicking on the&nbsp;
            <b>Level</b>. If you still are suspicious, remove the record by clicking the <b>Delete</b> button.
          </p>

        </div> 

        { /* Submissions body - render the game selector, approved submissions list, and submissions list */ }
        <div className="submissions-body">

          { /* Submissions list component - contains both the approved submission list, and unapproved submissions list */ }
          <div className="submissions-list">
            <h3>Approved Submissions:</h3>

            { /* If there are any approved submissions, render a submission table that renders them all */ }
            { approved.length > 0 ?
              <SubmissionsTable 
                submissions={ approved }
                isApproved={ true } 
                game={ selectedGame }
                handleClick={ removeFromApproved }
              />
            :

              // Otherwise, render a message instructing the moderator how to add approved submissions to the approved list
              <p><i>Approve a submission to add it to the list!</i></p>
            }

            { /* Approve all button - When pressed, all submissions in the approved list will be approved in the database, and page
            is reloaded. */ }
            <button type="button" onClick={ () => approveAll(user) } disabled={ approved.length === 0 || approving }>Approve All</button>

            { /* Unapproved submissions list: renders all the submissions in game that have not been approved */ }
            <h3>Submissions:</h3>

            { /* If the submissions[game] has been defined, we can attempt to render the submission table. */ }
            { submissions[selectedGame] ? 

              // If the array of all unapproved submissions is greater than 0, we can render the submission table
              submissions[selectedGame].length > 0 ?
                <SubmissionsTable 
                  submissions={ submissions[selectedGame] }
                  isApproved={ false }
                  game={ selectedGame } 
                  handleClick={ addToApproved } 
                />
              :

                // Otherwise, render a message stating that there do not exist any unapproved submissions for game.
                <p><i>This game has no unapproved submissions!</i></p>

            :

              // Loading component while we await the submissions to be loaded
              <p>Loading...</p>
              
            }

          </div>
        </div>
      </div>
    </div>
};

/* ===== EXPORTS ===== */
export default Submissions;