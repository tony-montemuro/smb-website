/* ===== IMPORTS ===== */
import styles from "./PageControls.module.css";
import FrontendHelper from "../../helper/FrontendHelper.js";
import PageControlsLogic from "./PageControls.js";
import PageController from "./PageController";

function PageControls({ totalItems, itemsPerPage, pageNum, setPageNum, itemName, useDropdown }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { getStartAndEnd, } = PageControlsLogic();

  // helper functions
  const { numberWithCommas } = FrontendHelper();
  
  /* ===== PAGE CONTROLS COMPONENT ===== */
  return totalItems > itemsPerPage &&
    <div className={ styles.pageControls }>

      { /* Page viewer - render the set of pages shown on the current page */ }
      <div className={ styles.viewer }>
        Showing { (getStartAndEnd(itemsPerPage, pageNum, totalItems).start)+1 } to&nbsp;
        { Math.min(((getStartAndEnd(itemsPerPage, pageNum, totalItems).end)+1), totalItems) } of { numberWithCommas(totalItems) } { itemName }
      </div>

      { /* Page controller - render the page controller, which should differ based on the `useDropdown` argument */ }
      <PageController
        totalItems={ totalItems }
        itemsPerPage={ itemsPerPage }
        pageNum={ pageNum }
        setPageNum={ setPageNum }
        useDropdown={ useDropdown }
      />

    </div>;
};

/* ===== EXPORTS ===== */
export default PageControls;