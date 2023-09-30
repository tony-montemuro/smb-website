/* ===== IMPORTS ===== */
import { UserContext } from "../../utils/Contexts.js";
import { useContext, useState } from "react";
import TimeHelper from "../../helper/TimeHelper";

const CountdownTimer = () => {
    /* ===== CONTEXTS ===== */

    // user state & update user function from user context
    const { user, updateUser } = useContext(UserContext);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getTimeDifference } = TimeHelper();

    // FUNCTION 1: getTimeRemaining - function that returns an object that describes the time remaining until midnight UTC
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 return, 1 possible outcome):
    // using the current timestamp and a timestamp of the current date at midnight UTC, we can get the time difference by subtracting
    // the two dates converted to miliseconds. using the milisecond value, we can extract the hours, minutes, and seconds until midnight
    // after some formatting, we can finally return an object containing these three time measurenements
    const getTimeRemaining = () => {
        // define our two dates
        const current = new Date();
        const midnight = new Date();

        // set the time to the next midnight in UTC
        midnight.setUTCHours(24, 0, 0, 0);

        // compute time difference
        const timeDifference = getTimeDifference(current.getTime(), midnight.getTime());

        // Pad the values with leading zeros if necessary
        const formattedSeconds = timeDifference.seconds.toString().padStart(2, "0");
        const formattedMinutes = timeDifference.minutes.toString().padStart(2, "0");
        const formattedHours = timeDifference.hours.toString().padStart(2, "0");

        return {
            seconds: formattedSeconds,
            minutes: formattedMinutes,
            hours: formattedHours
        };
    };

    /* ===== STATES ===== */
    const [remainingTime, setRemainingTime] = useState(getTimeRemaining());

    /* ===== FUNCTIONS ===== */

    // FUNCTION 2: updateRemainingTime - function that updates the remainingTime hook
    // PRECONDITIONS (1 condition):
    // this function should be called every second to keep the remainingTime state hook updated
    // POSTCONDITIONS (2 possible outcome):
    // this function will always fetch the difference in time between the current time and midnight, and the setRemainingTime 
    // hook is updated using the result as a parameter. however, a special case occurs at midnight UTC, where we additionally
    // also want to update the user state
    const updateRemainingTime = () => {
        // Update the remainingTime state hook
        const timer = getTimeRemaining();
        setRemainingTime(timer);

        // special case: time has hit midnight UTC. in this case, we want to update the user state, since their report tokens
        // should be refreshed back to their default value
        if (timer.hours === "00" && timer.minutes === "00" && timer.seconds === "00") {
            updateUser(user.id);
        }
    };

    return { remainingTime, updateRemainingTime };
};

/* ===== EXPORTS ===== */
export default CountdownTimer;