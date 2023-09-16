/* ===== IMPORTS ===== */
import { useState } from "react";

const FiltersPopup = (defaultFilters) => {
    /* ===== STATES ===== */
    const [filters, setFilters] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: handleArrayFilterChange - code that is executed when the user makes a change to an array-based filter
    // PRECONDITIONS (1 parameter):
    // 1.) item: a string representing the item we will either filter in or out, depending on whether or not the item 
    // already existed in the filter
    // 2.) property: a string representing the name of the filter property (MUST be for an array-based filter)
    // POSTCONDITIONS (3 possible outcomes):
    // if this item is not part of our filter, we add it
    // if this item is part of our filter, and the filter has 2 or more items already, remove it
    // if this item is part of our filter, but it's the only item remaining in the filter, do nothing
    const handleArrayFilterChange = (item, property) => {
        // first, define our new array, which we will modify based on the item, property, and filters state
        let newArr;
        
        // next, we will essentially treat the proof type as a "toggle". if the type was already included in the `filters.live` array,
        // remove it. otherwise, add it
        if (filters[property].includes(item)) {
            newArr = filters[property].length > 1 ? filters[property].filter(val => val !== item) : filters[property];
        } else {
            newArr = filters[property].concat([item]);
        }

        // finally, sort & update the filters state by calling `setFilters`
        newArr.sort((a, b) => a - b);
        setFilters({ ...filters, [property]: newArr });
    };

    // FUNCTION 2: hasArrayFilterChanged - code that checks whether or not an array filter defined by property has changed
    // PRECONDITIONS (1 parameter):
    // 1.) property: a string representing the name of the filter property (MUST be for an array-based filter)
    // POSTCONDITIONS (2 possible outcomes):
    // if the arrays are equivalent, this implies the user has not changed from the default filters, so return true
    // otherwise, the user has changed one or more aspects of the filter, so return false
    const hasArrayFilterChanged = property => {
        // store the default filter state in defaultArr, and the current in currentArr
        const defaultArr = defaultFilters[property], currentArr = filters[property];

        // first, let's check the length. if this is different, we can immediately return true
        if (defaultArr.length !== currentArr.length) {
            return true;
        }

        // now, since arrays are assumed to be sorted, let's just compare elements 1 by 1. if any don't match, we return true
        for (let i = 0; i < defaultArr.length; i++) {
            if (defaultArr[i] !== currentArr[i]) {
                return true;
            }
        }

        // if we made it this far, both arrays must be equal, so no change has occured. return false
        return false;
    };

    // FUNCTION 3: handleFilterReset - code that is executed when user requests to reset the a filter for a non-array based filter
    // property
    // PRECONDITIONS (1 parameter):
    // 1.) property: a string representing the name of the filter property
    // POSTCONDITIONS (1 possible outcome):
    // we reset the property by calling the setFilters() function with the defaultFilters[property] as part of our argument
    const handleFilterReset = property => {
        setFilters({ ...filters, [property]: defaultFilters[property] });
    };

    // FUNCTION 4: handleFilterChange - code that is executed when the user makes a change to a non-array based filter property
    // PRECONDITIONS (1 parameter):
    // 1.) val: a variable representing the value the user selected
    // 2.) property: a string representing the name of the filter property (MUST be for an non-array based filter)
    // POSTCONDITIONS (1 possible outcomes):
    // the field in filters is updated to the value of `val` 
    const handleFilterChange = (val, property) => {
        setFilters({ ...filters, [property]: val });
    };

    // FUNCTION 5: hasFilterChanged - code that checks whether or not a non-array based filter has changed
    // PRECONDITIONS (1 parameter):
    // 1.) property: a string representing the name of the property we want to check for changes
    // POSTCONDITIONS (2 possible outcomes):
    // if the current value for `filters[property]` is the same as default, false is returned
    // otherwise, true is returned
    const hasFilterChanged = property => {
        return filters[property] !== defaultFilters[property];
    };

    // FUNCTION 6: handleFiltersResetAll - code that is executed when user requests to reset all filters
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // we reset the filters by calling the setFilters() function with the defaultFilters as an argument
    const handleFiltersResetAll = () => {
        setFilters(defaultFilters);
    };

    // FUNCTION 7: handleApplyFilters - code that is executed when the user requests to apply filters
    // PRECONDITIONS (2 parameters):
    // 1.) onApplyFunc: code that is executed in `Levelboard.js` when we apply filters
    // 2.) closePopup: a function we can use to close the popup, which we want to do after applying filters
    // POSTCONDITIONS (1 possible outcome):
    // we apply filters by calling the `onApplyFunc` with our `filters` state as a parameter, and close the popup by calling
    // the `setPopup` function with the false argument
    const handleApplyFilters = (onApplyFunc, closePopup) => {
        onApplyFunc(filters);
        closePopup(false);
    };

    return { 
        filters, 
        setFilters,
        handleArrayFilterChange, 
        hasArrayFilterChanged, 
        handleFilterReset,
        handleFilterChange, 
        hasFilterChanged, 
        handleFiltersResetAll,
        handleApplyFilters
    };
};

/* ===== EXPORTS ===== */
export default FiltersPopup;