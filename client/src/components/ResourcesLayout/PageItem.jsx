/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function PageItem({ page, currentPage, setCurrentPage }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { cleanLevelName } = FrontendHelper();

  /* ===== PAGE ITEM COMPONENT ===== */
  return (
    <li className="resources-layout-page-item">

      { /* Page item header - render the name of the page, which can be selected to expand to  */ }
      <Link to={ page.name } onClick={ () => setCurrentPage(page.name) }>{ cleanLevelName(page.name) }</Link>

      { /* If this page is the current page, render it's headers as another list of items */ }
      { currentPage === page.name &&
        <ul className="resources-layout-header-list">
          { page.headers.map(header => {
            return <li key={ header }>{ cleanLevelName(header) }</li>
          })}
        </ul>
      }
    </li>
  );
};

/* ===== EXPORTS ===== */
export default PageItem;