/* ===== IMPORTS ===== */
import "./PageControls.css";
import PageControlsLogic from "./PageControls.js";
import PageController from "./PageController";

function PageControls({ totalItems, itemsPerPage, pageNum, setPageNum, itemName, isDetailedController = true }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { getStartAndEnd, } = PageControlsLogic();
  
  /* ===== PAGE CONTROLS COMPONENT ===== */
  return totalItems > itemsPerPage &&
    <div className="page-controls">

      { /* Page viewer - render the set of pages shown on the current page */ }
      <div className="page-viewer">
        Showing { (getStartAndEnd(itemsPerPage, pageNum, totalItems).start)+1 } to&nbsp;
        { Math.min(((getStartAndEnd(itemsPerPage, pageNum, totalItems).end)+1), totalItems) } of { totalItems } { itemName }
      </div>

      { /* Page controller - render the page controller, which should differ based on the `isDetailedController` argument */ }
      <PageController
        totalItems={ totalItems }
        itemsPerPage={ itemsPerPage }
        pageNum={ pageNum }
        setPageNum={ setPageNum }
        isDetailedController={ isDetailedController }
      />
      
    </div>;
};

/* ===== EXPORTS ===== */
export default PageControls;