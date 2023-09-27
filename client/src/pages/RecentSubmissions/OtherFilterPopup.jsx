/* ===== IMPORTS ===== */
import { useEffect } from "react";
import BooleanFilter from "./BooleanFilter.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";
import OtherFilterPopupLogic from "./OtherFilterPopup.js";

function OtherFilterPopup({ popup, setPopup, searchParams, setSearchParams }) {
  /* ===== VARIABLES ===== */
  const defaultFilters = {
    categories: [],
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
    updateCategoriesFilterAll,
    updateCategoriesFilter,
    updateBooleanFilter,
    resetFiltersAll,
    closePopup, 
    closePopupAndUpdate 
  } = OtherFilterPopupLogic();

  // helper functions
  const { categoryB2F } = FrontendHelper();

  /* ===== EFFECTS ===== */
  
  // code that is executed when the component mounts
  useEffect(() => {
    initializeFilters(searchParams);
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== OTHER FILTER POPUP COMPONENT ===== */
  return popup && filters &&
    <div className="recent-submissions-popup">
      <div className="recent-submissions-popup-inner">

        { /* Render buttom to close the popup */ }
        <div className="recent-submissions-popup-close-btn">
          <button type="button" onClick={ () => closePopup(setPopup) }>Close</button>
        </div>

        { /* Render the "title" of the popup */ }
        <h1>Other Filters</h1>

        { /* Form for updating the various filters */ }
        <form onSubmit={ () => closePopupAndUpdate(setPopup, searchParams, setSearchParams) }>

          { /* First, render the filter options for categories */ }
          <div className="recent-submissions-popup-category-filter">
            <div className="recent-submissions-popup-filter-title">
              <h2>Categories</h2>
              { filters.categories.length !== defaultFilters.categories.length &&
                <button type="button" onClick={ updateCategoriesFilterAll }>Reset</button>
              }
            </div>
            { categories && 
              <div className="recent-submissions-popup-filter-btns">

                { /* Render a special button for selecting all the categories */ }
                <button
                  type="button"
                  key="all"
                  onClick={ updateCategoriesFilterAll }
                  className={ `recent-submissions-filter-btn${ filters.categories.length === 0 ? " recent-submissions-filter-btn-selected" : "" }` }
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
                      onClick={ () => updateCategoriesFilter(category) }
                      className={ `recent-submissions-filter-btn${ filters.categories.length === 0 || filters.categories.includes(category) ? " recent-submissions-filter-btn-selected" : "" }` }
                    >
                      { categoryB2F(category) }
                    </button>
                  );
                })}

              </div>
            }
          </div>

          { /* Then, we can render the remaining boolean filters */ }
          <div className="recent-submissions-popup-boolean-filters">
            { booleanFilters.map(filter => {
              return <BooleanFilter filter={ filter } filters={ filters } onClick={ updateBooleanFilter } key={ filter.name } />;
            })}
          </div>

          { /* Finally, render button to update the forms (submit form), and reset all filters */ }
          <div className="recent-submissions-popup-submit-btns">
            <button type="button" onClick={ () => resetFiltersAll(defaultFilters) }>Reset Filters</button>
            <button type="submit">Apply Filters</button>
          </div>
  
        </form>

      </div>
    </div>;
};

/* ===== EXPORTS ===== */
export default OtherFilterPopup;