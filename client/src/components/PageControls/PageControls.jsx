/* ===== IMPORTS ===== */
import "./PageControls.css";
import PageControlsLogic from "./PageControls.js";

function PageControls({ totalItems, itemsPerPage, pageNum, setPageNum, itemName }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { getStartAndEnd, getMaxPage } = PageControlsLogic();
  
  /* ===== PAGE CONTROLS COMPONENT ===== */
  return totalItems > itemsPerPage &&
    <div className="page-controls">

    { /* Page viewer - render the set of pages shown on the current page */ }
    <div className="page-viewer">
      Showing { (getStartAndEnd(itemsPerPage, pageNum, totalItems).start)+1 } to&nbsp;
      { Math.min(((getStartAndEnd(itemsPerPage, pageNum, totalItems).end)+1), totalItems) } of { totalItems } { itemName }
    </div>

    { /* Page controls - render buttons to navigate to the previous and next page, as well as a dropdown for the
    user to select any valid page */ }
      <div className="page-controller">

        { /* Previous page button */ }
        <button 
          type="button"
          onClick={ () => setPageNum(pageNum-1) } 
          disabled={ pageNum <= 1 }
        >
          Previous Page
        </button>

        { /* Page selector */ }
        <select title="Select a page number" value={ pageNum } onChange={ (e) => setPageNum(parseInt(e.target.value)) }>
          { [...Array(getMaxPage(totalItems, itemsPerPage)).keys()].map(num => {
            return <option value={ num+1 } key={ num+1 }>{ num+1 }</option>;
          })}
        </select>

        { /* Next page button */ }
        <button 
          type="button"
          onClick={ () => setPageNum(pageNum+1) } 
          disabled={ pageNum >= getMaxPage(totalItems, itemsPerPage) }
        >
          Next Page
        </button>

      </div>
    </div>;
};

/* ===== EXPORTS ===== */
export default PageControls;