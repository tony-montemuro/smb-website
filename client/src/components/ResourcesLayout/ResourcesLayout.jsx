/* ===== IMPORTS ===== */
import "./ResourcesLayout.css";
import { Outlet } from "react-router-dom";
import styles from "./ResourcesLayout.module.css";
import PageItem from "./PageItem";
import ResourcesLayoutLogic from "./ResourcesLayout.js";

function ResourcesLayout() {
  /* ===== VARIABLES ===== */
  const { pages, currentPage, handleHeaderClick, handlePageClick } = ResourcesLayoutLogic();

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
                headerClickFunc={ handleHeaderClick }
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