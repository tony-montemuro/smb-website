const TimeHelper = () => {
    /* ===== FUNCTIONS ===== */
    // PRECONDITIONS (2 parameters):
    // 1.) lower: an integer representing a timestamp in miliseconds. must be less or equal to upper
    // 2.) upper: an integer representing a timestamp in miliseconds. must be greater than or equal to lower
    // POSTCONDITIONS (1 possible outcome, 1 return):
    // an object is returned the stores the seconds, minutes, hours, and days remaining between lower and upper
    const getTimeDifference = (lower, upper) => {
        // compute time difference
        const timeDifference = upper-lower;

        // convert time difference to hours, minutes, and seconds (note: timeDifference is in ms)
        const seconds = Math.floor((timeDifference/1000)%60);
        const minutes = Math.floor((timeDifference/1000/60)%60);
        const hours = Math.floor((timeDifference/1000/60/60)%24);
        const days = Math.floor((timeDifference/1000/60/60/24));

        return {
            seconds: seconds,
            minutes: minutes,
            hours: hours,
            days: days
        };
    };

    return { getTimeDifference };
};

/* ===== EXPORTS ===== */
export default TimeHelper;