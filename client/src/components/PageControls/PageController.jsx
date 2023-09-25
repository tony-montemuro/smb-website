/* ===== IMPORTS ===== */
import PageControlsLogic from "./PageControls.js";
import PageNumberButton from "./PageNumberButton.jsx";

function PageController({ totalItems, itemsPerPage, pageNum, setPageNum, useDropdown }) {
  /* ===== FUNCTIONS ===== */
  
  // functions from the js file
  const { getMaxPage, getMiddlePages } = PageControlsLogic();

  /* ===== PAGE CONTROLLER COMPONENT ===== */
  if (useDropdown) {
    return (
      // Dropdown page controller - render buttons to navigate to the previous and next page, as well as a dropdown for the
      // user to select any valid page. Better for small page counts
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
    );
  } else {
    const maxPage = getMaxPage(totalItems, itemsPerPage);
    const middlePages = getMiddlePages(pageNum, maxPage);

    return (
      // Page controller - render a button for the first page, the last page, and a button for each page between [pageNum, pageNum+5]
      <div className="page-controller">
        { /* Previous page button */ }
        <button 
          type="button"
          onClick={ () => setPageNum(pageNum-1) } 
          disabled={ pageNum <= 1 }
        >
          Previous Page
        </button>

        { /* Render button for first page */ }
        <PageNumberButton currentPageNum={ pageNum } pageNum={ 1 } setPageNum={ setPageNum } />

        { middlePages.length > 0 && middlePages[0] !== 2 && "..." }

        { /* Render the "middle" page buttons */ }
        { middlePages.map(page => {
          return <PageNumberButton currentPageNum={ pageNum } pageNum={ page } setPageNum={ setPageNum } key={ page } />;
        })}

        { middlePages.length > 0 && middlePages[middlePages.length-1] !== maxPage-1 && "..." }

        { /* Render button for last page */ }
        <PageNumberButton currentPageNum={ pageNum } pageNum={ maxPage } setPageNum={ setPageNum } />

        { /* Next page button */ }
        <button 
          type="button"
          onClick={ () => setPageNum(pageNum+1) } 
          disabled={ pageNum >= getMaxPage(totalItems, itemsPerPage) }
        >
          Next Page
        </button>
      </div>
    );
  }
};

/* ===== EXPORTS ===== */
export default PageController;