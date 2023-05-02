/* ===== IMPORTS ===== */
import { useState } from "react";
import HomeRead from "../../database/read/HomeRead";

const Home = () => {
    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryRecentSubmissions } = HomeRead();

    // FUNCTION 1: getSubmissions - retrieve 5 most recent submissions from database, and update the submissions state
    // PRECONDITIONS (1 condition):
    // this function should be called when the Home component is first mounted
    // POSTCONDITIONS (1 possible outcome):
    // the most recent submissions are retrieved, and the submissions state is updated by calling setSubmissions() function
    const getSubmissions = async () => {
        const submissions = await queryRecentSubmissions();
        setSubmissions(submissions);
        console.log(submissions);
    };

    // FUNCTION 2: makePlural - given a number, determine what character should end a string
    // PRECONDITIONS (1 parameter):
    // 1.) n: an integer value, at least 1
    // POSTCONDITIONS (2 possible outcomes):
    // if n is any value greater than 1, we return 's' to make the caller string plural
    // otherwise, return an empty string
    const makePlural = (n) => {
        return n > 1 ? "s" : "";
    };

    // FUNCTION 3: getTimeDifference - given a timestamp, determine how long ago the timestamp occured given the current time
    // PRECONDITIONS (1 parameter):
    // 1.) timestamp: a string representing a timestamp, typically formatted in the PostgreSQL `timestamptz` format
    // POSTCONDITIONS (4 possible outcomes):
    // If the time between now and the timestamp is less than a minute, return string describing time difference in seconds
    // If the time between now and the timestamp is less than an hour, return string describing time difference in minutes
    // If the time between now and the timestamp is less than a day, return string describing time difference in hours
    // Otherwise, return string describing time difference in days
    const getTimeDifference = (timestamp) => {
        // first, use the current time to compute the difference in time in seconds
        const current = new Date();
        const submissionDate = new Date(timestamp);
        const secondsAgo = Math.floor((current-submissionDate)/1000);

        if (secondsAgo < 60) {
            // less than a minute ago, return time in seconds
            return `${ secondsAgo } second${ makePlural(secondsAgo) } ago`;
        } else if (secondsAgo < 3600) {
            // less than an hour ago, show minutes
            const minutesAgo = Math.floor(secondsAgo/60);
            return `${ minutesAgo } minute${ makePlural(minutesAgo) } ago`; 
        } else if (secondsAgo < 86400) {
            // less than a day ago, show hours
            const hoursAgo = Math.floor(secondsAgo/3600);
            return `${ hoursAgo } hour${ makePlural(hoursAgo) } ago`;
        } else {
            // more than a day ago, show days
            const daysAgo = Math.floor(secondsAgo/86400);
            return `${ daysAgo } day${ makePlural(daysAgo) } ago`;
        }
    };

    return { submissions, getSubmissions, getTimeDifference };
};

/* ===== EXPORTS ===== */
export default Home;