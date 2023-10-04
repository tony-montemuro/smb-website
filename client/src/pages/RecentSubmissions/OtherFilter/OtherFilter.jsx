/* ===== IMPORTS ===== */
import { useEffect } from "react";
import styles from "./OtherFilter.module.css";
import BooleanFilter from "./BooleanFilter.jsx";
import FrontendHelper from "../../../helper/FrontendHelper.js";
import Loading from "../../../components/Loading/Loading.jsx";
import OtherFilterLogic from "./OtherFilter.js";

function OtherFilter({ searchParams, setSearchParams, categories }) {
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
    filters, 
    initializeFilters, 
    updateCategoryFilterAll,
    updateCategoryFilter,
    updateBooleanFilter,
    resetFiltersAll,
    closePopupAndUpdate 
  } = OtherFilterLogic(categories);

  // helper functions
  const { categoryB2F } = FrontendHelper();

  /* ===== EFFECTS ===== */
  
  // code that is executed when the component mounts
  useEffect(() => {
    initializeFilters(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== OTHER FILTER COMPONENT ===== */
  return filters &&
    <>
      <h1 id={ styles.header }>Other Filters</h1>
      <form onSubmit={ () => closePopupAndUpdate(searchParams, setSearchParams) }>
        <div className={ styles.filters }>

          { /* First, render the filter options for categories */ }
          <div className={ styles.title }>
            <h2>Categories</h2>
            { filters.category.length !== defaultFilters.category.length &&
              <button type="button" onClick={ updateCategoryFilterAll }>Reset</button>
            }
          </div>
          { categories ?
            <div className={ styles.btns }>

              { /* Render button to select all categories */ }
              <button
                type="button"
                key="all"
                onClick={ updateCategoryFilterAll }
                className={ filters.category.length === 0 ? styles.selected : "" }
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
                    className={ filters.category.length === 0 || filters.category.includes(category) ? styles.selected : "" }
                  >
                    { categoryB2F(category) }
                  </button>
                );
              })}

            </div>
          :
            <Loading />
          }

          { /* Then, we can render the remaining boolean filters */ }
          <div className={ styles.boolean }>
            { booleanFilters.map(filter => {
              return <BooleanFilter filter={ filter } filters={ filters } onClick={ updateBooleanFilter } key={ filter.name } />;
            })}
          </div>
        </div>

        { /* Finally, render button to update the forms (submit form), and reset all filters */ }
        <div id={ styles.right } className={ styles.btns }>
          <button type="button" onClick={ () => resetFiltersAll(defaultFilters) }>Reset Filters</button>
          <button type="submit">Apply Filters</button>
        </div>

      </form>
    </>;
};

/* ===== EXPORTS ===== */
export default OtherFilter;