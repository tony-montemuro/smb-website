/* ===== IMPORTS ===== */
import { useState } from "react";
import TimeHelper from "../../helper/TimeHelper";

const CountdownTimer = () => {
    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getTimeToMidnightUTC } = TimeHelper();

    // FUNCTION 1: getTimeRemaining - function that returns an object that describes the time remaining until midnight UTC
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 return, 1 possible outcome):
    // using the current timestamp and a timestamp of the current date at midnight UTC, we can get the time difference by subtracting
    // the two dates converted to miliseconds. using the milisecond value, we can extract the hours, minutes, and seconds until midnight
    // after some formatting, we can finally return an object containing these three time measurenements
    const getTimeRemaining = () => {
        // first, get time remaining to midnight in miliseconds
        const timeToMidnight = getTimeToMidnightUTC();

        // convert time difference to hours, minutes, and seconds (note: timeToMidnight is in ms)
        const seconds = Math.floor((timeToMidnight/1000)%60).toString().padStart(2, "0");
        const minutes = Math.floor((timeToMidnight/1000/60)%60).toString().padStart(2, "0");
        const hours = Math.floor((timeToMidnight/1000/60/60)%24).toString().padStart(2, "0");

        return { seconds, minutes, hours };
    };

    /* ===== STATES ===== */
    const [remainingTime, setRemainingTime] = useState(getTimeRemaining());

    /* ===== FUNCTIONS ===== */

    // FUNCTION 2: updateRemainingTime - function that updates the remainingTime hook
    // PRECONDITIONS (1 condition):
    // this function should be called every second to keep the remainingTime state hook updated
    // POSTCONDITIONS (1 possible outcome):
    // this function will always fetch the difference in time between the current time and midnight, and the setRemainingTime 
    // hook is updated using the result as a parameter
    const updateRemainingTime = () => {
        setRemainingTime(getTimeRemaining());
    };

    return { remainingTime, updateRemainingTime };
};

/* ===== EXPORTS ===== */
export default CountdownTimer;