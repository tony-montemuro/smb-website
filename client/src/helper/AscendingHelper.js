const AscendingHelper = () => {
    // FUNCTION 1: getAscendingValue - function that takes the ascending input the user is interacting with, and
    // determines how the ascending state is updated
    // PRECONDITIONS (3 parameters):
    // 1.) a string, either "score" or "time"
    // 2.) a boolean which determines whether or not the checkbox is switched ON or OFF 
    // 3.) a boolean which represents the ascending value of the level state we are dealing with
    // POSTCONDITIONS (1 possible outcome):
    // using the parameters passed, we determine the new value of "ascending", and return it
    const getAscendingValue = (type, checked, ascending) => {
        const otherType = type === "score" ? "time" : "score";

        if (ascending === null && checked) {
            return type;
        }
        if (ascending === otherType && checked) {
            return "both";
        }
        if (ascending === "both" && !checked) {
            return otherType;
        }
        return null;
    };

    return { getAscendingValue };
};

/* ===== EXPORTS ===== */
export default AscendingHelper;