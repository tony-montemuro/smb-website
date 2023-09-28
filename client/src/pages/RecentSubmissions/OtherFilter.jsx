/* ===== IMPORTS ===== */
import { PopupContext } from "../../utils/Contexts.js";
import { useContext, useEffect } from "react";
import BooleanFilter from "./BooleanFilter.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";
import OtherFilterLogic from "./OtherFilter.js";

function OtherFilter({ searchParams, setSearchParams }) {
  /* ===== CONTEXTS ===== */

  // close popup function from context context
  const { closePopup } = useContext(PopupContext);

  /* ===== VARIABLES ===== */
  const defaultFilters = {
    category: [],
    live: null,
    score: null,
    tas: null,
  };
  const booleanFilters = [
    { name: "live", title: "Live", true: "Live", false: "Replay", default: defaultFilters.live },
    { name: "score", title: "Type", true: "Score", false: "Time", default: defaultFilters.score },
    { name: "tas", title: "TAS", true: "TAS", false: "Normal", default: defaultFilters.tas },
  ];

  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { 
    categories, 
    filters, 
    initializeFilters, 
    fetchCategories, 
    updateCategoryFilterAll,
    updateCategoryFilter,
    updateBooleanFilter,
    resetFiltersAll,
    closePopupAndUpdate 
  } = OtherFilterLogic();

  // helper functions
  const { categoryB2F } = FrontendHelper();

  /* ===== EFFECTS ===== */
  
  // code that is executed when the component mounts
  useEffect(() => {
    initializeFilters(searchParams);
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== OTHER FILTER COMPONENT ===== */
  return filters &&
    <div className="recent-submissions-other-filter">

      { /* Render the "title" of the popup */ }
      <h1>Other Filters</h1>

      { /* Form for updating the various filters */ }
      <form onSubmit={ () => closePopupAndUpdate(closePopup, searchParams, setSearchParams) }>

        { /* First, render the filter options for categories */ }
        <div className="recent-submissions-popup-category-filter">
          <div className="recent-submissions-filter-title">
            <h2>Categories</h2>
            { filters.category.length !== defaultFilters.category.length &&
              <button type="button" onClick={ updateCategoryFilterAll }>Reset</button>
            }
          </div>
          { categories && 
            <div className="recent-submissions-filter-btns">

              { /* Render a special button for selecting all the categories */ }
              <button
                type="button"
                key="all"
                onClick={ updateCategoryFilterAll }
                className={ `recent-submissions-filter-btn${ filters.category.length === 0 ? " recent-submissions-filter-btn-selected" : "" }` }
              >
                All
              </button>
              
              <br />

              { /* Now, render a button for selecting each category */ }
              { categories.map(category => {
                return (
                  <button 
                    type="button"
                    key={ category }
                    onClick={ () => updateCategoryFilter(category) }
                    className={ `recent-submissions-filter-btn${ filters.category.length === 0 || filters.category.includes(category) ? " recent-submissions-filter-btn-selected" : "" }` }
                  >
                    { categoryB2F(category) }
                  </button>
                );
              })}

            </div>
          }
        </div>

        { /* Then, we can render the remaining boolean filters */ }
        <div className="recent-submissions-filter-boolean">
          { booleanFilters.map(filter => {
            return <BooleanFilter filter={ filter } filters={ filters } onClick={ updateBooleanFilter } key={ filter.name } />;
          })}
        </div>

        { /* Finally, render button to update the forms (submit form), and reset all filters */ }
        <div id="recent-submissions-filter-submit-btns-right" className="recent-submissions-filter-submit-btns">
          <button type="button" onClick={ () => resetFiltersAll(defaultFilters) }>Reset Filters</button>
          <button type="submit">Apply Filters</button>
        </div>

      </form>
    </div>;
};

/* ===== EXPORTS ===== */
export default OtherFilter;