const PageControls = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: getStartAndEnd - given the number of items & page number, retrieve the start and end item indicies
    // PRECONDITIONS (2 parameters):
    // 1.) itemsPerPage: an integer representing the max number of items that should exist on each page 
    // 2.) pageNumber: the page number the user is currently on
    // POSTCONDITIONS (2 possible returns, 1 possible outcome):
    // two variables are returned
    // a.) start: the index of the first item on the page
    // b.) end: the index of the last item on the page
    const getStartAndEnd = (itemsPerPage, pageNumber) => {
        const start = itemsPerPage*(pageNumber-1);
        const end = (itemsPerPage*pageNumber)-1;
        return { start, end };
    };

    // FUNCTION 2: getMaxPage - function that returns the max number of pages, given the total # of items
    // PRECONDITIONS (1 parameter):
    // 1.) numItems: an integer representing the total number of items
    // 2.) itemsPerPage: an integer representing the number of posts per page
    // POSTCONDITIONS (1 possible outcome):
    // using these two values, the max page number is returned
    const getMaxPage = (numItems, itemsPerPage) => {
        return Math.ceil(numItems/itemsPerPage);
    };

    return { getStartAndEnd, getMaxPage };
};

/* ===== EXPORTS ===== */
export default PageControls;