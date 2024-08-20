const Sections = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: renderBoolean - simple function that transforms boolean to string, so that it can be rendered to user
    // PRECONDITIONS (1 parameter):
    // 1.) bool: a boolean value
    // POSTCONDITIONS (2 possible outcomes):
    // if bool is true, return "Yes"
    // if bool is false, return "No"
    const renderBoolean = bool => {
        return bool ? "Yes" : "No";
    };

    return { renderBoolean };
};

/* ===== EXPORTS ===== */
export default Sections;