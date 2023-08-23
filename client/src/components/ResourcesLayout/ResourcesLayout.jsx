/* ===== IMPORTS ===== */
import "./ResourcesLayout.css";
import { Outlet } from "react-router-dom";
import { StaticCacheContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import PageItem from "./PageItem";
import ResourcesLayoutLogic from "./ResourcesLayout.js";

function ResourcesLayout() {
  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== VARIABLES ===== */
  const { pages, currentPage, handleHeaderClick, handlePageClick } = ResourcesLayoutLogic();

  /* ===== STATES ===== */
  const [cacheLoaded, setCacheLoaded] = useState(false);

  /* ===== EFFECTS ===== */

  // code that is executed when the component first mounts, or when the games static cache is updated
  useEffect(() => {
    if (staticCache.games.length > 0) {
      setCacheLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache.games]);

  /* ===== RESOURCES LAYOUT COMPONENT ===== */
  return cacheLoaded ?
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
  :
  
    // If cache has not yet been loaded, simply render loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default ResourcesLayout;