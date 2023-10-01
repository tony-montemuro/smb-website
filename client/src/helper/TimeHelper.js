const TimeHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: getTimeToMidnightUTC - function that computes, based on the client's time, how long until midnight UTC in ms
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // a single integer is returned representing the difference in time between midnight UTC and the current time in miliseconds
    const getTimeToMidnightUTC = () => {
        // define our two dates
        const current = new Date();
        const midnight = new Date();

        // set the time to the next midnight in UTC
        midnight.setUTCHours(24, 0, 0, 0);

        // return the difference
        return midnight-current;
    };

    return { getTimeToMidnightUTC };
};

/* ===== EXPORTS ===== */
export default TimeHelper;