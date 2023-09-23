/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";
import ModeratorTabLogic from "./ModeratorTab.js";

function ModeratorTab({ tab }) {
  /* ===== VARIABLES ===== */
  const currentPageType = useLocation().pathname.split("/")[2];
  const pageType = tab.pageType;
  const content = tab.content;

  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { handleTabClick } = ModeratorTabLogic();

  /* ===== MODERATOR TAB COMPONENT ===== */
  return (
    <div 
      className={ `moderator-tab${ currentPageType === pageType ? " moderator-tab-active" : "" }` }
      onClick={ () => handleTabClick(pageType) }
    >
      { content }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeratorTab;