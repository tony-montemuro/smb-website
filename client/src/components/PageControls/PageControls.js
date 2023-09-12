/* ===== IMPORTS ===== */

const PageControls = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: getMaxPage - function that returns the max number of pages, given the total # of items
    // PRECONDITIONS (1 parameter):
    // 1.) numItems: an integer representing the total number of items
    // 2.) itemsPerPage: an integer representing the number of posts per page
    // POSTCONDITIONS (1 possible outcome):
    // using these two values, the max page number is returned
    const getMaxPage = (numItems, itemsPerPage) => {
        return Math.ceil(numItems/itemsPerPage);
    };

    return { getMaxPage };
};

/* ===== EXPORTS ===== */
export default PageControls;