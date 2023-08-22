const ResourcesLayout = () => {
    /* ===== VARIABLES ===== */
    const pages = [
        { 
            name: "overview", 
            headers: ["general", "types", "score_calculation", "pausing_rule", "proof_requirements", "regions", "replay_errors", "emulators"]
        },
        {
            name: "getting_started",
            headers: ["capture_cards", "OBS"]
        }
    ];

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: handleHeaderClick - function that is called when a user selects a header from the sidebar
    // PRECONDITIONS (1 parameter):
    // 1.) header: a string which corresponds to the id of a header on one of the resource pages
    // POSTCONDITIONS (1 possible outcome):
    // using vanilla JS, we scroll to the section based on the header parameter
    const handleHeaderClick = header => {
        const section = document.querySelector(`#${ header }`);
        const yOffset = -75;
        const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
    };

    return { pages, handleHeaderClick };
};

/* ===== EXPORTS ===== */
export default ResourcesLayout;