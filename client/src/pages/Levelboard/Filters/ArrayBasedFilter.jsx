/* ===== IMPORTS ===== */
import styles from "./Filters.module.css";

function ArrayBasedFilter({ filters, selectedFilter, behaviors }) {
  /* ===== FUNCTIONS ===== */
  const hasFilterChanged = behaviors.hasFilterChanged;
  const handleFilterChangeAll = behaviors.handleFilterChangeAll;
  const handleFilterChange = behaviors.handleFilterChange;
  const handleFilterReset = behaviors.handleFilterReset;

  /* ===== ARRAY BASED FILTER COMPONENT ===== */
  return (
    <div>
      { /* Levelboard filter header - render the name of the filter, as well as a reset button if the filter has been modified
      from default value */ }
      <div className={ styles.header }>
        <h2>{ selectedFilter.name }</h2>
        { hasFilterChanged(selectedFilter.propertyName) && 
          <button type="button" onClick={ () => handleFilterReset(selectedFilter.propertyName) }>Reset</button>
        }
      </div>

      { /* Levelboard filter btns - render a button for each item of the selected filter, which users can toggle on and off */ }
      <div className={ styles.btns }>

        { /* First, render a button for the "all" option */ }
        <button
          type="button"
          className={ filters[selectedFilter.propertyName].length === selectedFilter.items.length ? styles.selected : "" }
          onClick={ () => handleFilterChangeAll(selectedFilter.items.map(item => item.id), selectedFilter.propertyName) }
        >
          All
        </button>

        <br />

        { /* Then, we render a button for each element in the `selectedFilters.items` array */ }
        { selectedFilter.items.map(item => {
          return (
            <button 
              type="button" 
              className={ filters[selectedFilter.propertyName].includes(item.id) ? styles.selected : "" }
              onClick={ () => handleFilterChange(item.id, selectedFilter.items.length, selectedFilter.propertyName) }
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