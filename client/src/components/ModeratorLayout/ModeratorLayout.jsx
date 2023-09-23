/* ===== IMPORTS ===== */
import { MessageContext, ModeratorLayoutContext, UserContext } from "../../utils/Contexts";
import { Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModeratorLogic from "./ModeratorLayout.js";
import ModeratorTabs from "../ModeratorTabs/ModeratorTabs.jsx";

function ModeratorLayout() {
  /* ===== STATES & FUNCTIONS ===== */
  
  // states & functions from the js file
  const { games, dispatchGames, updateLayout, getNumberOfSubmissions } = ModeratorLogic();

  /* ===== VARIABLES ===== */
  const tabs = [
    { 
      pageType: undefined, 
      content: "About Moderation" 
    },
    { 
      pageType: "approvals", 
      content: `${ getNumberOfSubmissions(true) > 0 ? `(${ getNumberOfSubmissions(true) }) ` : "" }New Submissions`
    },
    {
      pageType: "reports",
      content: `${ getNumberOfSubmissions(false) > 0 ? `(${ getNumberOfSubmissions(false) }) ` : "" }Reported Submissions`
    }
  ];
  const navigate = useNavigate();

  /* ===== CONTEXTS ===== */
  
  // user state & is moderator function from user context
  const { user, isModerator } = useContext(UserContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

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

        { /* Moderator tabs - render tabs we can use to navigate the moderation hub */ }
        <ModeratorTabs tabs={ tabs } />

        { /* Moderation Layout Content: renders the contents of the page based on the URL */ }
        <div className="moderator-layout-content">
          <Outlet />
        </div>

      </div>
    </ModeratorLayoutContext.Provider>
};

/* ===== EXPORTS ===== */
export default ModeratorLayout;