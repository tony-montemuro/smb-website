/* ===== IMPORTS ===== */
import "./ResourcesLayout.css";
import { Outlet } from "react-router-dom";
import PageItem from "./PageItem";
import ResourcesLayoutLogic from "./ResourcesLayout.js";

function ResourcesLayout() {
  /* ===== VARIABLES ===== */
  const { pages, currentPage, handleHeaderClick, handlePageClick } = ResourcesLayoutLogic();

  /* ===== RESOURCES LAYOUT COMPONENT ===== */
  return (
    <div className="resources-layout">

      { /* Resources layout sidebar - render the page controls here.  */ }
      <div className="resources-layout-sidebar">
        <h1>Resources</h1>
        <ul className="resources-layout-page-list">
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
      <div className="resources-layout-content">
        <Outlet />
      </div>
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ResourcesLayout;