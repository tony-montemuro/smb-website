/* ===== IMPORTS ===== */
import "./ModeratorLayout.css";
import { MessageContext, ModeratorLayoutContext, UserContext } from "../../utils/Contexts";
import { Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ModeratorLogic from "./ModeratorLayout.js";

function ModeratorLayout() {
  /* ===== VARIABLES ===== */
  const pageType = useLocation().pathname.split("/")[2];
  const navigate = useNavigate();

  /* ===== CONTEXTS ===== */
  
  // user state & is moderator function from user context
  const { user, isModerator } = useContext(UserContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES & FUNCTIONS ===== */
  
  // states & functions from the js file
  const { games, dispatchGames, updateLayout, handleTabClick, getNumberOfSubmissions } = ModeratorLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, or when the user state changes
  useEffect(() => {
    // only initialize component once the user state has initialized
    if (user.id !== undefined) {
      // if user is not logged in or a moderator of at least 1 game, render error, navigate to homepage, and render early
      if (!(isModerator())) {
        addMessage("Forbidden access.", "error");
        navigate("/");
        return;
      }

      // if we made it this far, go ahead and initialize the layout
      updateLayout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ===== MODERATOR LAYOUT COMPONENT ===== */
  return isModerator() && games &&
    <ModeratorLayoutContext.Provider value={ { games, dispatchGames } }>
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
              { getNumberOfSubmissions(true) > 0 && `(${ getNumberOfSubmissions(true) })` } 
              &nbsp;New Submissions
            </div>

            { /* Reported Submissions tab - Brings moderator to the list of report submissions */ }
            <div 
              className={ `moderator-layout-tab${ pageType === "reports" ? " moderator-layout-tab-active" : "" }` }
              onClick={ () => handleTabClick("reports") }
            >
              { getNumberOfSubmissions(false) > 0 && `(${ getNumberOfSubmissions(false) })` }
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
          <Outlet />
        </div>

      </div>
    </ModeratorLayoutContext.Provider>
};

/* ===== EXPORTS ===== */
export default ModeratorLayout;