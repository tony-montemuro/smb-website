function BooleanFilter({ filter, filters, onClick }) {
  /* ===== BOOLEAN FILTER COMPONENT ===== */
  return (
    <div>
      { /* Render the "title" of the filter */ }
      <div className="recent-submissions-popup-filter-title">
        <h2>{ filter.title }</h2>
        { filters[filter.name] !== filter.default && 
          <button type="button" onClick={ () => onClick(filter.name, filter.default) }>Reset</button> 
        }
      </div>

      <div className="recent-submissions-popup-filter-btns">

        { /* Button for no-filter */ }
        <button 
          type="button"
          className={ `recent-submissions-filter-btn${ filters[filter.name] === null ? " recent-submissions-filter-btn-selected" : "" }` }
          onClick={ () => onClick(filter.name, null) }
        >
          All
        </button>

        { /* Button for "true" filter */ }
        <button 
          type="button"
          className={ `recent-submissions-filter-btn${ filters[filter.name] === true ? " recent-submissions-filter-btn-selected" : "" }` }
          onClick={ () => onClick(filter.name, true) }
        >
          { filter.true }-only
        </button>

        { /* Button for "false" filter */ }
        <button 
          type="button"
          className={ `recent-submissions-filter-btn${ filters[filter.name] === false ? " recent-submissions-filter-btn-selected" : "" }` }
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