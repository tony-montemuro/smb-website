/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import RPCRead from "../../database/read/RPCRead";

const OtherFilter = () => {
    /* ===== CONTEXTS ===== */

    // add message state from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [categories, setCategories] = useState(undefined);
    const [filters, setFilters] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { getCategories } = RPCRead();

    // FUNCTION 1: initializeFilters - code that will give the `filters` state an initial value based on the searchParams state
    // PRECONDITIONS (1 parameter):
    // 1.) searchParams: a URLSearchParams object which defines the filters on the recent submissions
    // POSTCONDITIONS (1 possible outcome):
    // based on the values of the searchParams state, we initialize the `filters` state by calling `setFilters`
    const initializeFilters = searchParams => {
        // initialize filters object with empty arrays
        const booleanFilters = ["live", "score", "tas"];
        const filters = { category: [] };
        booleanFilters.forEach(filter => {
            filters[filter] = [];
        });

        // fill the filters object according to the `searchParams` parameter
        for (const [key, value] of searchParams) {
            if (key in filters) {
                filters[key].push(value);
            }
        };
        booleanFilters.forEach(filter => {
            if (filters[filter].includes(true) && filters[filter].includes(false)) {
                filters[filter] = null;
            } else {
                const value = filters[filter][0];
                filters[filter] = value ? value === "true" : null;
            }
        });

        // update filters state hook by calling the `setFilters` function
        setFilters(filters);
    };

    // FUNCTION 2: fetchCategories - code that fetches the list of all valid categories
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, this function updates the `categories` state by calling the `setCategories` setter function
    // with the result of the query as an argument
    // if the query is unsuccessful, this function will render an error to the user, keeping the categories loading
    const fetchCategories = async () => {
        try {
            const categories = await getCategories();
            setCategories(categories);
        } catch (error) {
            addMessage("Category data failed to load.", "error");
        };
    };

    // FUNCTION 3: updateCategoryFilterAll - function that updates the category filter when user hits the "all" button
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the filters.category state is set equal to an empty array by calling the `setFilters` setter function
    const updateCategoryFilterAll = () => {
        setFilters({ ...filters, category: [] });
    };

    // FUNCTION 4: updateCategoryFilter - function that updates the category filter based on the category parameter
    // PRECONDITIONS (1 parameter):
    // 1.) category: the name of the category we are attempting to toggle on/off
    // POSTCONDITIONS (4 possible outcomes):
    // if category is present in the filter already, we will generally update the filter state to the same array without the
    // category
    // however, in the case where the category array contains ONLY the category we are trying to remove, this function does nothing
    // if the category is not present in the filter array, we generally update the filter state to the same array with the category
    // appended to the end
    // however, in the case where adding an additional category means that we have ALL the categories, this function updates
    // the category filter to an empty array
    const updateCategoryFilter = category => {
        if (filters.category.includes(category)) {
            const newCategory = filters.category.filter(row => row !== category);
            if (newCategory.length > 0) {
                setFilters({ ...filters, category: newCategory });
            }
        } else {
            const newCategory = filters.category.concat([category]);
            setFilters({ ...filters, category: newCategory.length !== categories.length ? newCategory : [] });
        }
    };

    // FUNCTION 5: updateBooleanFilter - function that updates a boolean filter based on a filter name, and value
    // PRECONDITIONS (2 parameters):
    // 1.) filter: a string representing the name of the filter we want to update: must be "live", "tas", or "type"
    // 2.) value: a string representing the value we wish to update the filter to
    // POSTCONDITIONS (1 possible outcome):
    // the filters object is updated using the filter and value parameters by calling the `setFilters` setter function
    const updateBooleanFilter = (filter, value) => {
        setFilters({ ...filters, [filter]: value });
    };

    // FUNCTION 6: resetFiltersAll - function that resets all the filters to their default values
    // PRECONDITIONS (1 parameter):
    // 1.) defaultFitlers: a filters object which represents the default value of the `filter` state
    // POSTCONDITIONS (1 possible outcome):
    // the filters state is set to the defaultFilters object by calling the `setFilters` state with the defaultFilters object
    // as an argument
    const resetFiltersAll = defaultFilters => {
        setFilters(defaultFilters);
    };

    // FUNCTION 7: closePopupAndUpdate - function that closes the user filter popup, and updates the search params state
    // PRECONDITIONS (3 parameters):
    // 1.) closePopup: a function that, when called, will simply close the popup
    // 2.) searchParams: a URLSearchParams specifying the filters currently applied to the recent submissions page
    // 3.) setSearchParams: a setter function we can use to update the search params
    // POSTCONDITIONS (1 possible outcome):
    // given our old searchParams object, as well as the filters state, we generate a new search params object, and
    // update the `searchParams` state. finally, we also close the popup by calling the `closePopup` function
    const closePopupAndUpdate = (closePopup, searchParams, setSearchParams) => {
        // first, let's create an identical, new searchParams object, with all filters in `filterName` removed
        const newSearchParams = new URLSearchParams();
        for (const [key, value] of searchParams) {
            if (!(Object.keys(filters).includes(key))) {
                newSearchParams.append(key, value);
            }
        }

        // next, let's append any new filters from the `filters` state
        Object.keys(filters).forEach(filter => {
            const value = filters[filter];
            if (filter === "category") {
                value.forEach(category => {
                    newSearchParams.append("category", category);
                });
            } else {
                if (value !== null) {
                    newSearchParams.append(filter, value);
                }
            }
        });

        // finally, let's update the search params state, and close the popup
        setSearchParams(newSearchParams);
        closePopup();
    };

    return { 
        categories, 
        filters, 
        initializeFilters, 
        fetchCategories, 
        updateCategoryFilterAll,
        updateCategoryFilter,
        updateBooleanFilter,
        resetFiltersAll,
        closePopupAndUpdate 
    };
};

/* ===== EXPORTS ===== */
export default OtherFilter;