/* ===== IMPORTS ===== */
import "./ResourcesLayout.css";
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import PageItem from "./PageItem";
import ResourcesLayoutLogic from "./ResourcesLayout.js";

function ResourcesLayout() {
  /* ===== VARIABLES ===== */
  const { pages } = ResourcesLayoutLogic();
  const location = useLocation();
  const path = location.pathname.split("/");
  const pageName = path[2] ? path[2] : "overview";

  /* ===== STATES ===== */
  const [currentPage, setCurrentPage] = useState(pageName);

  /* ===== RESOURCES LAYOUT COMPONENT ===== */
  return (
    <div className="resources-layout">

      { /* Resources layout sidebar - render the page controls here.  */ }
      <div className="resources-layout-sidebar">
        <h1>Resources</h1>
        <ul className="resources-layout-page-list">
          { pages.map(page => {
            return <PageItem page={ page } currentPage={ currentPage } setCurrentPage={ setCurrentPage } key={ page.name } />
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