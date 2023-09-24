/* ===== IMPORTS ===== */
import { MessageContext, UserContext } from "../../utils/Contexts.js";
import { Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModeratorTabs from "../ModeratorTabs/ModeratorTabs.jsx";

function AdministratorLayout() {
  /* ===== VARIABLES ===== */
  const tabs = [
    { 
      pageType: undefined, 
      content: "About Administrating"
    },
    { 
      pageType: "game-moderators", 
      content: "Game Moderators"
    },
    {
      pageType: "post",
      content: "Create Post"
    }
  ];
  const navigate = useNavigate();

  /* ===== CONTEXTS ===== */

  // add message state from message context
  const { addMessage } = useContext(MessageContext);

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts OR when the user state changes
  useEffect(() => {
    // only initialize component once the user state has initialized
    if (user.id !== undefined) {
      // if user is not logged in or is not an administrator, render error, navigate to homepage, and render early
      if (!user.profile || !user.profile.administrator) {
        addMessage("Forbidden access.", "error");
        navigate("/");
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ===== ADMINISTRATOR LAYOUT COMPONENT ===== */
  return user.id !== undefined && user.profile && user.profile.administrator &&
    <div className="administrator-layout">

      { /* Moderator tabs - render tabs we can use to navigate the administrator hub */ }
      <ModeratorTabs tabs={ tabs } />

      { /* Administrator Layout Content: renders the contents of the page based on the URL */ }
      <div className="administrator-layout-content">
        <Outlet />
      </div>

    </div>

};

/* ===== EXPORTS ===== */
export default AdministratorLayout;