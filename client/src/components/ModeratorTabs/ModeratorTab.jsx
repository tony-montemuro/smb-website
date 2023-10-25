/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";
import styles from "./ModeratorTabs.module.css";
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
      className={ `${ styles.tab }${ currentPageType === pageType ? ` ${ styles.active }` : "" }` }
      onClick={ () => handleTabClick(pageType) }
    >
      { content }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeratorTab;