function ArrayBasedFilter({ filters, selectedFilter, hasFilterChanged, handleFilterChange, handleFilterReset }) {
  /* ===== ARRAY BASED FILTER COMPONENT ===== */
  return (
    <div className="levelboard-filter-container">

      { /* Levelboard filter header - render the name of the filter, as well as a reset button if the filter has been modified
      from default value */ }
      <div className="levelboard-filter-header">
        <h2>{ selectedFilter.name }</h2>
        { hasFilterChanged(selectedFilter.propertyName) && 
          <button type="button" onClick={ () => handleFilterReset(selectedFilter.propertyName) }>Reset</button>
        }
      </div>

      { /* Levelboard filter btns - render a button for each item of the selected filter, which users can toggle on and off */ }
      <div className="levelboard-filter-btns">
        { selectedFilter.items.map(item => {
          return (
            <button 
              type="button" 
              className={ `levelboard-radio-btn ${ filters[selectedFilter.propertyName].includes(item.id) ? `levelboard-radio-btn-selected` : "" }` }
              onClick={ () => handleFilterChange(item.id, selectedFilter.propertyName) }
              key={ item.id }
            >
              { item.name }
            </button>
          );
        })}
      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default ArrayBasedFilter;