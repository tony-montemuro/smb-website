const ScrollHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: scrollToId - code that scrolls a user to a tag based on the id parameter
    // PRECONDITIONS (1 parameter):
    // 1.) id: a string which corresponds to the a tag whose id matches in the document
    // POSTCONDITIONS (1 possible outcome):
    // perform scroll to element whose id matches `id`
    const scrollToId = id => {
        const root = document.querySelector(":root");
        const section = document.querySelector(`#${ id }`);
        const yOffset = -parseInt((getComputedStyle(root).getPropertyValue("--navbar-height")))-20;
        const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
    };

    return { scrollToId };
};

/* ===== EXPORTS ===== */
export default ScrollHelper;