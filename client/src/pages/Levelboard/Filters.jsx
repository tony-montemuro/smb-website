/* ===== IMPORTS ===== */
import { GameContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import FiltersLogic from "./Filters.js";
import FrontendHelper from "../../helper/FrontendHelper";
import ArrayBasedFilter from "./ArrayBasedFilter";

function Filters({ currentFilters, defaultFilters, updateBoard }) {
  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== VARIABLES ===== */
  const arrayBasedFilters = [
    {
      name: "Proof Type",
      propertyName: "live",
      items: [{ id: true, name: "Live-only" }, { id: false, name: "Replays-only" }]
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
    },
    {
      name: "Run Type",
      propertyName: "tas",
      items: [{ id: false, name: "Normal runs" }, { id: true, name: "TAS runs" }]
    }
  ];

  /* ===== STATES & FUNCTIONS ===== */
  
  // states and functions from the js file
  const { 
    filters,
    setFilters,
    handleArrayFilterChangeAll, 
    handleArrayFilterChange, 
    hasArrayFilterChanged, 
    handleFilterReset, 
    handleFilterChange, 
    hasFilterChanged,
    handleFiltersResetAll,
    handleApplyFilters 
  } = FiltersLogic(defaultFilters, currentFilters);

  // helper functions
  const { dateB2F } = FrontendHelper();

  /* ===== EFFECTS ===== */

  // code that is executed each time the `currentFilters` parameter changes
  useEffect(() => {
    setFilters(currentFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilters]);

  /* ===== FILTERS COMPONENT ===== */
  return filters &&
    <div className="levelboard-filters">

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
              behaviors={{
                hasFilterChanged: hasArrayFilterChanged,
                handleFilterChangeAll: handleArrayFilterChangeAll,
                handleFilterChange: handleArrayFilterChange,
                handleFilterReset: handleFilterReset
              }}
              key={ filter.propertyName }
            />
          );
        })}

        { /* Obsolete runs filter - allows user to select whether or not to see ALL submissions, or just most recent */ }
        <div className="levelboard-filter-container">

          { /* Levelboard filter header - render the name of the filter, as well as a reset button if the filter has been modified
          from default value */ }
          <div className="levelboard-filter-header">
            <h2>Obsolete Runs</h2>
            { hasFilterChanged("obsolete") && 
              <button type="button" onClick={ () => handleFilterReset("obsolete") }>Reset</button>
            }
          </div>

          { /* Levelboard filter btns - render a button for each obsolete button (hidden & shown), which users can toggle on and off */ }
          <div className="levelboard-filter-btns">

            { /* Hidden button */ }
            <button 
              type="button" 
              className={ `levelboard-radio-btn${ !filters["obsolete"] ? ` levelboard-radio-btn-selected` : "" }` }
              onClick={ () => handleFilterChange(false, "obsolete") }
            >
              Hidden
            </button>

            { /* Shown button */ }
            <button 
              type="button" 
              className={ `levelboard-radio-btn${ filters["obsolete"] ? ` levelboard-radio-btn-selected` : "" }` }
              onClick={ () => handleFilterChange(true, "obsolete") }
            >
              Shown
            </button>

          </div>

        </div>

        { /* End date filter - allows user to select a cuttoff date for submissions to be shown */ }
        <div className="levelboard-filter-container">

          { /* Levelboard filter header - render the name of the filter, as well as a reset button if the filter has been modified
          from default value */ }
          <div className="levelboard-filter-header">
            <h2>End Date</h2>
            { hasFilterChanged("endDate") && 
              <button type="button" onClick={ () => handleFilterReset("endDate") }>Reset</button>
            }
          </div>

          { /* Levelboard filter calendar - render a date input for the user to select an end date */ }
          <div className="levelboard-filter-calendar">
            <input 
              type="date" 
              id="endDate"
              value={ filters.endDate }
              min={ game.release_date }
              max={ dateB2F() }
              onChange={ (e) => handleFilterChange(e.target.value, e.target.id) }
            />
          </div>

        </div>

      </div>

      { /* Levelboard filter buttons - allow the user to either apply the filters, or reset them to default values */ }
      <div className="levelboard-filters-bottom">
        <button type="button" onClick={ handleFiltersResetAll }>Reset filters</button>
        <button type="button" onClick={ () => handleApplyFilters(updateBoard) }>Apply filters</button>
      </div>

    </div>
};

/* ===== EXPORTS ===== */
export default Filters;