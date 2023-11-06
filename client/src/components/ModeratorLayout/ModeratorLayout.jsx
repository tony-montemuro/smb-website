/* ===== IMPORTS ===== */
import { MessageContext, ModeratorLayoutContext, UserContext } from "../../utils/Contexts";
import { Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../Loading/Loading.jsx";
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

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  // user state & is moderator function from user context
  const { user, isModerator } = useContext(UserContext);

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, or when the user state changes
  useEffect(() => {
    // only initialize component once the user state has initialized
    if (user.id !== undefined) {
      // if user is not logged in or a moderator of at least 1 game, render error, navigate to homepage, and render early
      if (!(isModerator())) {
        addMessage("Forbidden access.", "error", 5000);
        navigate("/");
        return;
      }

      // if we made it this far, go ahead and initialize the layout
      updateLayout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ===== MODERATOR LAYOUT COMPONENT ===== */
  return isModerator() && games ?
    <ModeratorLayoutContext.Provider value={ { games, dispatchGames } }>
      <ModeratorTabs tabs={ tabs } />
      <Outlet />
    </ModeratorLayoutContext.Provider>
  :
    <Loading />
};

/* ===== EXPORTS ===== */
export default ModeratorLayout;