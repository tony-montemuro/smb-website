/* ===== IMPORTS ===== */
import TimeHelper from "./TimeHelper";

const FrontendHelper = () => {
    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getTimeDifference } = TimeHelper();

    // FUNCTION 1: capitalize
    // PRECONDITIONS (1 parameter):
    // 1.) str: a string whose first character is a letter
    // POSTCONDITIONS (1 possible outcome): 
    // a copy of str is returned with it's first letter capitalized
    const capitalize = str => {
        return str.charAt(0).toUpperCase()+str.slice(1);
    };

    // FUNCTION 2: cleanLevelName
    // PRECONDITION (1 parameter):
    // 1.) str: a string with the following format: 
    // word1_word2_..._(wordn)
    // POSTCONDITIONS (1 possible outcome):
    // returns a copy of str with the following format:
    // Word1 Word2 ... (Wordn)
    const cleanLevelName = str => {
        const words = str.split("_");
        for (let i = 0; i < words.length; i++) {
            if (words[i][0] !== "(") {
                words[i] = words[i][0].toUpperCase()+words[i].substr(1) 
            } else {
                words[i] = words[i][0]+words[i][1].toUpperCase()+words[i].substr(2);
            }
        }
        return words.join(" ");
    };

    // FUNCTION 3: dateB2F - ("date backend-to-frontend") converts a back-end date to front-end style 
    // PRECONDITIONS (1 parameter):
    // 1.) date: a string representing a date, which can take two possible states:
        // a.) a postgresql timestamptz formatted date
        // b.) null
    // POSTCONDITIONS (2 possible outcomes):
    // if null, the function will return the current date. 
    // otherwise, the function will return the formatted date, converted to the client's location (timezone). output will have the 
    // following format: YYYY-MM-DD
    const dateB2F = date => {
        const d = date ? new Date(date) : new Date();
        const year = d.getFullYear();
        const month = ("0"+(d.getMonth()+1)).slice(-2);
        const day = ("0"+d.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    };

    // FUNCTION 4: recordB2F - ("record backend-to-frontend") convert record from back-end format to front-end format
    // PRECONDITION (2 parameters): 
    // 1.) record is a float number with at most two decimal places (should only have decimals if the type is "score")
    // 2.) type is either "score" or "time"
    // POSTCONDITION (1 possible outcome):
    // if the type is time, we fix the number of decimal places to two, convert to string, and return
    // if the type is score, return a string representing a formatted integer (includes commas)
    const recordB2F = (record, type) => {
        return type === "time" ? record.toFixed(2) : record.toLocaleString("en-US");
    };

    // FUNCTION 5: secondsToHours - convert a time from seconds to hours
    // PRECONDITIONS (2 parameters):
    // 1.) record is a float number with at most two decimals places
    // 2.) type is either "score" or "time"
    // POSTCONDITION (2 possible outcome):
    // if the type is time, we will compute the hours, minuntes, seconds, and centiseconds, and return a string with the
    // following format: XX:XX:XX.XX
    // if the type is score, return a string representing a formatted integer (includes commas)
    const secondsToHours = (record, type) => {
        if (type === "time") {
            // calculate each unit of time
            let time = Math.floor(record);
            let hours = Math.floor(time/3600).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
            let minutes = Math.floor((time%3600)/60).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
            let seconds = Math.floor(time%60).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
            let centiseconds = Math.round((record%60-seconds)*100).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });

            // return with following format: XX:XX:XX.XX
            return `${ hours }:${ minutes }:${ seconds }.${ centiseconds }`;
        }

        // otherwise, just return formatted record
        return record.toLocaleString("en-US");
    };

    // FUNCTION 6: makePlural - given a number, determine what character should end a string
    // PRECONDITIONS (1 parameter):
    // 1.) n: an integer value, at least 1
    // POSTCONDITIONS (2 possible outcomes):
    // if n is any value greater than 1, we return 's' to make the caller string plural
    // otherwise, return an empty string
    const makePlural = n => {
        return n > 1 ? "s" : "";
    };

    // FUNCTION 7: getTimeAgo - given a timestamp, determine how long ago the timestamp occured given the current time
    // PRECONDITIONS (1 parameter):
    // 1.) timestamp: a string representing a timestamp, typically formatted in the PostgreSQL `timestamptz` format
    // POSTCONDITIONS (4 possible outcomes):
    // If the time between now and the timestamp is less than a minute, return string describing time difference in seconds
    // If the time between now and the timestamp is less than an hour, return string describing time difference in minutes
    // If the time between now and the timestamp is less than a day, return string describing time difference in hours
    // Otherwise, return string describing time difference in days
    const getTimeAgo = timestamp => {
        // convert both the current time and the timestamp to the Data format
        const current = new Date();
        const submissionDate = new Date(timestamp);

        // get the difference between the two
        const timeDifference = getTimeDifference(submissionDate.getTime(), current.getTime());
        const days = timeDifference.days; 
        const hours = timeDifference.hours;
        const minutes = timeDifference.minutes;
        const seconds = timeDifference.seconds;

        // finally, return the appropriate string depending on the timeDifference object field values
        if (days > 0) {
            return `${ days } day${ makePlural(days) } ago`;
        } else if (hours > 0) {
            return `${ hours } hour${ makePlural(hours) } ago`;
        } else if (minutes > 0) {
            return `${ minutes } minute${ makePlural(minutes) } ago`; 
        } else {
            return `${ seconds } second${ makePlural(seconds) } ago`;
        }
    };

    // FUNCTION 8: categoryB2F - ("category backend-to-frontend") convert category from back-end format to front-end format
    // PRECONDITIONS (1 parameter):
    // 1.) category: a string representing a category, either "main" or "misc"
    // POSTCONDITIONS (1 possible outcome):
    // the category is transformed into the readable name
    const categoryB2F = category => {
        return category === "misc" ? "Miscellaneous" : "Main";
    };

    return { capitalize, cleanLevelName, dateB2F, recordB2F, secondsToHours, getTimeAgo, categoryB2F };
};

export default FrontendHelper;