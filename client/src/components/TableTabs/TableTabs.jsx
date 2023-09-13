/* ===== IMPORTS ===== */
import "./TableTabs.css";

function TableTabs({ elements, current, handleClick }) {
  /* ===== TABLE TAB BUTTONS ===== */
  return (
    <div className="tabs">
      { elements.map(element => {
        return (
          <button
            type="button"
            className={ `tab${ current === element.data ? " tab-active" : "" }` }
            onClick={ () => handleClick(element.data) }
            key={ element.data }
          >
            { element.renderedData }
          </button>
        );
      })}
    </div>
  );
};

/* ===== EXPORTS ===== */
export default TableTabs;