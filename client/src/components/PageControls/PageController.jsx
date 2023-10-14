/* ===== IMPORTS ===== */
import styles from "./PageController.module.css";
import ButtonList from "../ButtonList/ButtonList.jsx";
import PageControlsLogic from "./PageControls.js";

function PageController({ totalItems, itemsPerPage, pageNum, setPageNum, useDropdown }) {
  /* ===== FUNCTIONS ===== */
  
  // functions from the js file
  const { getMaxPage, getMiddlePages } = PageControlsLogic();

  /* ===== PAGE CONTROLLER COMPONENT ===== */

  // Dropdown page controller - render buttons to navigate to previous and next page, as well as a dropdown for the user to select
  // any valid page. Better for small page counts!
  if (useDropdown) {
    return (
      <div className={ styles.pageController }>

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
  } 
  
  // Page Number page controller - render a button for the first page, the last page, and a button for each page between 
  // [pageNum, pageNum+5]
  else {
    const maxPage = getMaxPage(totalItems, itemsPerPage);
    const middlePages = getMiddlePages(pageNum, maxPage);
    return (
      <div className={ styles.pageController }>

        { /* Previous page button */ }
        <div className={ styles.moveBtn }>
          <button 
            type="button"
            onClick={ () => setPageNum(pageNum-1) } 
            disabled={ pageNum <= 1 }
          >
            { "<-" }
          </button>
        </div>

        { /* Render buttons for each relevant page */ }
        <ButtonList 
          buttons={ [{ name: "1", value: 1 }] } 
          current={ pageNum } 
          setCurrent={ setPageNum } 
          hasPadding={ false } 
        />
        { middlePages.length > 0 && middlePages[0] !== 2 && 
          <span className={ styles.spread }>...</span> 
        }
        <ButtonList 
          buttons={ middlePages.map(page => ({ name: `${ page }`, value: page })) } 
          current={ pageNum } 
          setCurrent={ setPageNum }
          hasPadding={ false }
        />
        { middlePages.length > 0 && middlePages[middlePages.length-1] !== maxPage-1 &&
          <span className={ styles.spread }>...</span>
        }
        <ButtonList 
          buttons={ [{ name: `${ maxPage }`, value: maxPage }] } 
          current={ pageNum } 
          setCurrent={ setPageNum } 
          hasPadding={ false }  
        />

        { /* Next page button */ }
        <div className={ styles.moveBtn }>
          <button 
            type="button"
            onClick={ () => setPageNum(pageNum+1) } 
            disabled={ pageNum >= getMaxPage(totalItems, itemsPerPage) }
          >
            { "->" }
          </button>
        </div>

      </div>
    );
  }
};

/* ===== EXPORTS ===== */
export default PageController;