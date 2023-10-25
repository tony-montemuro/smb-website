const StylesHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: indexToParity - function that takes an index, and returns the parity-based classname
    // PRECONDITIONS (1 parameter):
    // 1.) index: an integer representing the index of a component
    // POSTCONDITIONS (1 possible outcome):
    // if the index is divisible by 2, the "even" string is returned. otherwise the "odd" stirng is returned
    const indexToParity = index => {
        return index % 2 === 1 ? "odd" : "even";
    };

    // FUNCTION 2: getNavbarHeight - function that returns the scrollbar height, a CSS variable
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the navbar height (px value) is returned as an integer
    const getNavbarHeight = () => {
        const root = document.querySelector(":root");
        return parseInt(getComputedStyle(root).getPropertyValue("--navbar-height"));
    };

    return { indexToParity, getNavbarHeight };
};

/* ===== EXPORTS ===== */
export default StylesHelper;