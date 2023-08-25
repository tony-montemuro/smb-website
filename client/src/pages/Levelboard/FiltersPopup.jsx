/* ===== IMPORTS ===== */
import { GameContext } from "../../utils/Contexts";
import { useContext } from "react";
import FiltersPopupLogic from "./FiltersPopup.js";
import ArrayBasedFilter from "./ArrayBasedFilter";

function FiltersPopup({ popup, setPopup, currentFilters, defaultFilters, onApplyFunc }) {
  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== VARIABLES ===== */
  const arrayBasedFilters = [
    {
      name: "Proof Type",
      propertyName: "live",
      items: [{ id: true, name: "Live-recordings" }, { id: false, name: "Replays" }]
    },
    {
      name: "Monkey",
      propertyName: "monkeys",
      items: game.monkey.map(monkey => {
        return { id: monkey.id, name: monkey.monkey_name }
      })
    },
    {
      name: "Platform",
      propertyName: "platforms",
      items: game.platform.map(platform => {
        return { id: platform.id, name: platform.platform_name }
      })
    },
    {
      name: "Region",
      propertyName: "regions",
      items: game.region.map(region => {
        return { id: region.id, name: region.region_name }
      })
    }
  ];

  /* ===== STATES & FUNCTIONS ===== */
  
  // states and functions from the js file
  const { 
    filters, 
    handleArrayFilterChange, 
    hasArrayFilterChanged, 
    handleArrayFilterReset, 
    handleFiltersResetAll,
    handleApplyFilters 
  } = FiltersPopupLogic(defaultFilters, currentFilters);

  /* ===== FILTERS POPUP COMPONENT ===== */
  return popup &&
    <div className="levelboard-popup">
      <div className="levelboard-popup-inner">

        { /* Close popup button */ }
        <div className="levelboard-popup-close-btn">
          <button type="button" onClick={ () => setPopup(false) }>Close</button>
        </div>

        { /* Levelboard filters header - render the header information for this popup */ }
        <div className="levelboard-filters-header">
          <h1>Filters</h1>
        </div>

        { /* Levelboard filters options - render the various filter options here */ }
        <div className="levelboard-filters-options">

          { /* Render an array-based filter component for each array-based filter */ }
          { arrayBasedFilters.map(filter => {
            return (
              <ArrayBasedFilter 
                filters={ filters }
                selectedFilter={ filter }
                hasFilterChanged={ hasArrayFilterChanged }
                handleFilterChange={ handleArrayFilterChange }
                handleFilterReset={ handleArrayFilterReset }
                key={ filter.propertyName }
              />
            );
          })}

        </div>

        { /* Levelboard filter buttons - allow the user to either apply the filters, or reset them to default values */ }
        <div className="levelboard-filter-bottom">
          <button type="button" onClick={ handleFiltersResetAll }>Reset filters</button>
          <button type="button" onClick={ () => handleApplyFilters(onApplyFunc, setPopup) }>Apply filters</button>
        </div>

      </div>
    </div>
};

/* ===== EXPORTS ===== */
export default FiltersPopup;