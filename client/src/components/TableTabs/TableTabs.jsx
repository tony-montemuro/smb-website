/* ===== IMPORTS ===== */
import "./TableTabs.css";
import FrontendHelper from "../../helper/FrontendHelper";

function TableTabs({ elements, current, handleClick }) {
  /* ===== FUNCTIONS ===== */
  const { capitalize } = FrontendHelper();
  
  /* ===== TABLE TAB BUTTONS ===== */
  return (
    <div className="tabs">
      { elements.map(element => {
        return (
          <button
            type="button"
            className={ `tab ${ current === element ? "tab-active" : "" }` }
            onClick={ () => handleClick(element) }
            key={ element }
          >
            { capitalize(element) }
          </button>
        );
      })}
    </div>
  );
};

/* ===== EXPORTS ===== */
export default TableTabs;