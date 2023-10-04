/* ===== IMPORTS ===== */
import styles from "./OtherFilter.module.css";

function BooleanFilter({ filter, filters, onClick }) {
  /* ===== BOOLEAN FILTER COMPONENT ===== */
  return (
    <div>
      { /* Render the "title" of the filter */ }
      <div className={ styles.title }>
        <h2>{ filter.title }</h2>
        { filters[filter.name] !== filter.default && 
          <button type="button" onClick={ () => onClick(filter.name, filter.default) }>Reset</button> 
        }
      </div>

      <div className={ styles.btns }>

        { /* Button for no-filter */ }
        <button 
          type="button"
          className={ filters[filter.name] === null ? styles.selected : "" }
          onClick={ () => onClick(filter.name, null) }
        >
          All
        </button>

        { /* Button for "true" filter */ }
        <button 
          type="button"
          className={ filters[filter.name] === true ? styles.selected : "" }
          onClick={ () => onClick(filter.name, true) }
        >
          { filter.true }-only
        </button>

        { /* Button for "false" filter */ }
        <button 
          type="button"
          className={ filters[filter.name] === false ? styles.selected : "" }
          onClick={ () => onClick(filter.name, false) }
        >
          { filter.false }-only
        </button>

      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default BooleanFilter;