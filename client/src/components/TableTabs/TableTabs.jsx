/* ===== IMPORTS ===== */
import "./TableTabs.css";
import styles from "./TableTabs.module.css";

function TableTabs({ elements, current, handleClick }) {
  /* ===== TABLE TAB BUTTONS ===== */
  return (
    <div className={ styles.tabs }>
      { elements.map(element => {
        return (
          <button
            type="button"
            className={ `${ styles.tab }${ current === element.data ? ` ${ styles.active }` : "" }` }
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