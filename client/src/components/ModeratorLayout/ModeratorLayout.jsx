/* ===== IMPORTS ===== */
import "./ModeratorLayout.css";
import { Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageContext, StaticCacheContext, SubmissionContext, UserContext } from "../../utils/Contexts";
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

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { submissions, handleTabClick, fetchSubmissions, getNumberOfSubmissions } = ModeratorLogic();

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

      // if we made it this far, fetch the submissions
      fetchSubmissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache, user]);

  /* ===== MODERATOR LAYOUT COMPONENT ===== */
  return (
    <div className="moderator-layout">

      { /* Moderator layout header - contains any header information for moderator hub */ }
      <div className="moderator-layout-header">

        { /* Moderator layout tabs - a div containing the tabs that allow the moderator to access different moderation
        pages */ }
        <div className="moderator-layout-tabs">

          { /* About Moderation Tab - Brings moderator to the moderation hub home page */ }
          <div 
            className={ `moderator-layout-tab ${ !pageType ? "moderator-layout-tab-active" : "" }` } 
            onClick={ () => handleTabClick(undefined) }
          >
            About Moderation
          </div>

          { /* New Submission Tab - Brings moderator to the list of new submissions */ }
          <div 
            className={ `moderator-layout-tab ${ pageType === "approvals" ? "moderator-layout-tab-active" : "" }` }
            onClick={ () => handleTabClick("approvals") }
          >
            { getNumberOfSubmissions(submissions.recent) > 0 && `(${ getNumberOfSubmissions(submissions.recent) })` } 
            &nbsp;New Submissions
          </div>

          { /* Reported Submissions tab - Brings moderator to the list of report submissions */ }
          <div 
            className={ `moderator-layout-tab ${ pageType === "reports" ? "moderator-layout-tab-active" : "" }` }
            onClick={ () => handleTabClick("reports") }
          >
            { getNumberOfSubmissions(submissions.reported) > 0 && `(${ getNumberOfSubmissions(submissions.reported) })` }
            &nbsp;Reported Submissions
          </div>

          { /* Create Post tab - Brings moderator to the post page */ }
          <div 
            className={ `moderator-layout-tab ${ pageType === "post" ? "moderator-layout-tab-active" : "" }` }
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
  );
};

/* ===== EXPORTS ===== */
export default ModeratorLayout;