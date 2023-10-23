/* ===== IMPORTS ===== */
import { Outlet } from "react-router-dom";
import styles from "./ResourcesLayout.module.css";
import PageItem from "./PageItem";
import ResourcesLayoutLogic from "./ResourcesLayout.js";
import ScrollHelper from "../../helper/ScrollHelper";

function ResourcesLayout() {
  /* ===== VARIABLES ===== */
  const { pages, currentPage, handlePageClick } = ResourcesLayoutLogic();

  /* ===== FUNCTIONS ===== */
  const { scrollToId } = ScrollHelper();

  /* ===== RESOURCES LAYOUT COMPONENT ===== */
  return (
    <div className={ styles.resourcesLayout }>

      { /* Resources layout sidebar - render the page controls here.  */ }
      <div className={ styles.sidebar }>
        <ul className={ styles.sidebarList }>
          { pages.map(page => {
            return (
              <PageItem 
                page={ page }
                currentPage={ currentPage }
                headerClickFunc={ scrollToId }
                pageClickFunc={ handlePageClick } 
                key={ page.name } 
              />
            );
          })}
        </ul>
      </div>

      { /* Resources layout content - render the resources page here (the actual content) */ }
      <div className={ styles.content }>
        <Outlet />
      </div>
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ResourcesLayout;