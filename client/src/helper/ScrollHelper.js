/* ===== IMPORTS ===== */
import StylesHelper from "./StylesHelper";

const ScrollHelper = () => {
    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getNavbarHeight } = StylesHelper();

    // FUNCTION 1: scrollToId - code that scrolls a user to a tag based on the id parameter
    // PRECONDITIONS (1 parameter):
    // 1.) id: a string which corresponds to the a tag whose id matches in the document
    // 2.) additionalOffset: an optional parameter that allows you to specify additional y offset; should be a positive integer
    // POSTCONDITIONS (1 possible outcome):
    // perform scroll to element whose id matches `id`
    const scrollToId = (id, additionalOffset) => {
        additionalOffset = additionalOffset ? additionalOffset : 0;
        const section = document.querySelector(`#${ id }`);
        const yOffset = -getNavbarHeight()-20-additionalOffset;
        const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
    };

    return { scrollToId };
};

/* ===== EXPORTS ===== */
export default ScrollHelper;