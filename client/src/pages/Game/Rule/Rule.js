const Rule = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: splitRule - function that takes a rule, and splits in into an array of strings on newline characters
    // PRECONDITIONS (1 parameter):
    // 1.) rule: a string representing a rule
    // POSTCONDITIONS (1 possible outcome):
    // an array of rule lines is returned, splitting on the newline character
    const splitRule = rule => {
        return rule.split("\n");
    };

    return { splitRule };
};

/* ===== EXPORTS ===== */
export default Rule;