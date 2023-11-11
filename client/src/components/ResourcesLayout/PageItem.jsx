/* ===== IMPORTS ===== */
import styles from "./PageItem.module.css";
import FrontendHelper from "../../helper/FrontendHelper";

function PageItem({ page, currentPage, headerClickFunc, pageClickFunc }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { snakeToTitle } = FrontendHelper();

  /* ===== PAGE ITEM COMPONENT ===== */
  return (
    <li className={ styles.pageItem }>

      { /* Page item header - render the name of the page, which can be selected to expand to  */ }
      <h2 onClick={ () => pageClickFunc(page.name) }>{ snakeToTitle(page.name) }</h2>

      { /* If this page is the current page, render it's headers as another list of items */ }
      { currentPage === page.name &&
        <ul className={ styles.headerList }>
          { page.headers.map(header => {
            return <li key={ header } onClick={ () => headerClickFunc(header) }>{ snakeToTitle(header) }</li>
          })}
        </ul>
      }
    </li>
  );
};

/* ===== EXPORTS ===== */
export default PageItem;