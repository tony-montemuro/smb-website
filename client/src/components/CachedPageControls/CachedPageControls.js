const CachedPageControls = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: getStartAndEnd - given the # of items per page, the total # of items, and page number, retrieve the start and end 
    // item indicies (one-based indexing)
    // PRECONDITIONS (3 parameters):
    // 1.) itemsPerPage: an integer representing the total number of items per page
    // 2.) numItems: an integer representing the total number of items
    // 3.) pageNum: an integer representing the max number of items that should exist on each page 
    // POSTCONDITIONS (2 possible returns, 1 possible outcome):
    // two variables are returned
    // a.) start: the index of the first item on the page
    // b.) end: the index of the last item on the page
    const getStartAndEnd = (itemsPerPage, numItems, pageNum) => {
        const start = Math.min((itemsPerPage*(pageNum-1))+1, numItems);
        const end = Math.min(itemsPerPage*pageNum, numItems);
        return { start: start, end: end };
    };

    // FUNCTION 2: getMaxPage - function that returns the max number of pages, given the # of items & number of items
    // per page
    // PRECONDITIONS (2 parameters):
    // 1.) numItems: an integer representing the total number of items
    // 2.) itemsPerPage: an integer representing the number of items per page
    // POSTCONDITIONS (1 possible outcome):
    // using these two values, the max page number is returned (must be at least 1)
    const getMaxPage = (numItems, itemsPerPage) => {
        return Math.max(Math.ceil(numItems/itemsPerPage), 1);
    };

    return { getStartAndEnd, getMaxPage };
};

/* ===== EXPORTS ===== */
export default CachedPageControls;