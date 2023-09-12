/* ===== IMPORTS ===== */
import "./CachedPageControls.css";
import CachedPageControlsLogic from "./CachedPageControls.js";

function CachedPageControls({ items, itemsPerPage, pageNum, setPageNum, itemsName }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { getStartAndEnd, getMaxPage } = CachedPageControlsLogic();

  /* ===== CACHED PAGE CONTROLS COMPONENT ===== */ 
  return items.length > itemsPerPage &&
    <div className="cached-page-controls">

      { /* Cached page viewer - render the set of pages shown on the current page */ }
      <div className="cached-page-viewer">
        Showing { getStartAndEnd(itemsPerPage, items.length, pageNum).start } to&nbsp;
        { getStartAndEnd(itemsPerPage, items.length, pageNum).end } of { items.length } { itemsName }
      </div>

      { /* Cached page controller - render buttons to navigate to the previous and next page, as well as a dropdown 
      for the user to select any valid page */ }
      <div className="cached-page-controller">

        { /* Previous page button */ }
        <button 
          type="button"
          onClick={ () => setPageNum(pageNum-1) } 
          disabled={ pageNum <= 1 }
        >
          Previous Page
        </button>

        { /* Page selector */ }
        <select value={ pageNum } onChange={ (e) => setPageNum(parseInt(e.target.value)) }>
          { [...Array(getMaxPage(items.length, itemsPerPage)).keys()].map(num => {
            return <option value={ num+1 } key={ num+1 }>{ num+1 }</option>;
          })}
        </select>

        { /* Next page button */ }
        <button
          type="button"
          onClick={ () => setPageNum(pageNum+1) } 
          disabled={ pageNum >= getMaxPage(items.length, itemsPerPage) }
        >
          Next Page
        </button>

      </div>

    </div>
};

/* ===== EXPORTS ===== */
export default CachedPageControls;