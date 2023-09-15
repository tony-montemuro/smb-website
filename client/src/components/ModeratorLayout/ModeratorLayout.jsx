/* ===== IMPORTS ===== */
import "./ModeratorLayout.css";
import { GamesContext, MessageContext, SubmissionContext, UserContext } from "../../utils/Contexts";
import { Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ModeratorLogic from "./ModeratorLayout.js";

function ModeratorLayout() {
  /* ===== VARIABLES ===== */
  const pageType = useLocation().pathname.split("/")[2];
  const navigate = useNavigate();

  /* ===== CONTEXTS ===== */
  
  // user state from user context
  const { user } = useContext(UserContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES & FUNCTIONS ===== */
  const [submissions, setSubmissions] = useState(undefined);
  const [games, setGames] = useState(undefined);

  /* ===== FUNCTIONS ===== */
  
  // functions from the js file
  const { fetchData, handleTabClick, getNumberOfSubmissions } = ModeratorLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, or when the user state changes
  useEffect(() => {
    async function init() {
      // if user is not a moderator, render error, navigate to homepage, and render early
      if (!user.is_mod) {
        addMessage("Forbidden access.", "error");
        navigate("/");
        return;
      }

      // otherwise, fetch games and submissions, and update their respective state hooks
      const { games, submissions } = await fetchData();
      setGames(games);
      setSubmissions(submissions);
    }

    // only initialize component once the user state has initialized
    if (user.id !== undefined) {
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ===== MODERATOR LAYOUT COMPONENT ===== */
  return user.is_mod && games && submissions &&
    <GamesContext.Provider value={ { games } }>
      <div className="moderator-layout">

        { /* Moderator layout header - contains any header information for moderator hub */ }
        <div className="moderator-layout-header">

          { /* Moderator layout tabs - a div containing the tabs that allow the moderator to access different moderation
          pages */ }
          <div className="moderator-layout-tabs">

            { /* About Moderation Tab - Brings moderator to the moderation hub home page */ }
            <div 
              className={ `moderator-layout-tab${ !pageType ? " moderator-layout-tab-active" : "" }` } 
              onClick={ () => handleTabClick(undefined) }
            >
              About Moderation
            </div>

            { /* New Submission Tab - Brings moderator to the list of new submissions */ }
            <div 
              className={ `moderator-layout-tab${ pageType === "approvals" ? " moderator-layout-tab-active" : "" }` }
              onClick={ () => handleTabClick("approvals") }
            >
              { getNumberOfSubmissions(submissions.recent) > 0 && `(${ getNumberOfSubmissions(submissions.recent) })` } 
              &nbsp;New Submissions
            </div>

            { /* Reported Submissions tab - Brings moderator to the list of report submissions */ }
            <div 
              className={ `moderator-layout-tab${ pageType === "reports" ? " moderator-layout-tab-active" : "" }` }
              onClick={ () => handleTabClick("reports") }
            >
              { getNumberOfSubmissions(submissions.reported) > 0 && `(${ getNumberOfSubmissions(submissions.reported) })` }
              &nbsp;Reported Submissions
            </div>

            { /* Create Post tab - Brings moderator to the post page */ }
            <div 
              className={ `moderator-layout-tab${ pageType === "post" ? " moderator-layout-tab-active" : "" }` }
              onClick={ () => handleTabClick("post") }
            >
              Create Post
            </div>

          </div>

        </div>

        { /* Moderation Layout Content: renders the contents of the page based on the URL */ }
        <div className="moderator-layout-content">
          <SubmissionContext.Provider value={ { submissions } }>
            <Outlet />
          </SubmissionContext.Provider>
        </div>

      </div>
    </GamesContext.Provider>
};

/* ===== EXPORTS ===== */
export default ModeratorLayout;