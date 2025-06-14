/* ===== IMPORTS ===== */
import { formatDistanceToNowStrict } from "date-fns";
import { isAlphaPattern } from "../utils/RegexPatterns";

const FrontendHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: capitalize - function that takes a string, and returns it with the first word capitalized
    // PRECONDITIONS (1 parameter):
    // 1.) str: a string whose first character is a letter
    // POSTCONDITIONS (1 possible outcome): 
    // a copy of str is returned with it's first letter capitalized
    const capitalize = str => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    // FUCNTION 2: snakeToTitle - converts a string in snake case to title case
    // PRECONDITIONS (1 parameter):
    // 1.) str: a string with snake case formatting
    // POSTCONDITIONS (1 possible outcome):
    // generally, the first letter of each word is capitalized, and underscores are replaced with spaces. however, if
    // the user wants to have an underscore, they can specify that with two underscores `__`, and this function will handle
    // that request
    const snakeToTitle = str => {
        let title = "";
        for (let i = 0; i < str.length; i++) {

            // special case: handle if character is underscore, including double underscores
            if (str[i] === "_") {
                if (i < str.length - 1 && str[i + 1] === "_") {
                    title += "_";
                    i += 1;
                } else {
                    title += " ";
                }
            }

            // general case: handle any other character, and perform capitalization when necessary
            else {
                if (i > 0 && str[i - 1] === "_") {
                    title += str[i].toUpperCase();
                } else {
                    title += str[i];
                }
            }

        }

        return capitalize(title);
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
        const month = ("0" + (d.getMonth() + 1)).slice(-2);
        const day = ("0" + d.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    };


    // FUNCTION 4: numberWithCommas - converts integer x to a string with commas for increased reablilty
    // PRECONDITIONS (1 parameter):
    // 1.) x: an integer
    // POSTCONDITIONS (1 possible outcome):
    // a string reprsentation of the number is returned, including commas
    const numberWithCommas = x => {
        return x.toLocaleString("en-US");
    };

    // FUNCTION 5: secondsToHours - convert a time from seconds to hours
    // PRECONDITIONS (2 parameters):
    // 1.) record is a float number with at most two decimals places
    // 2.) type is either "score" or "time"
    // 3.) decimalPlaces is an integer, specifying how many decimal places we should round to, typically this is 2.
    // this parameter is only relevant when the type is "time"
    // POSTCONDITION (2 possible outcome):
    // if the type is time, we will compute the hours, minuntes, seconds, and centiseconds, and return a string with the
    // following format: X[X...X]:XX:XX.XX
    // if the type is score, return a string representing a formatted integer (includes commas)
    const secondsToHours = (record, type, decimalPlaces = 2) => {
        if (type === "time") {
            // calculate each unit of time
            record = parseFloat(record.toFixed(decimalPlaces));
            let time = Math.floor(record);
            let hours = Math.floor(time / 3600).toLocaleString("en-US", { minimumIntegerDigits: 1, useGrouping: false });
            let minutes = Math.floor((time % 3600) / 60).toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
            let seconds = Math.floor(time % 60).toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });

            let multiplier = Math.pow(10, decimalPlaces);
            let decimals = Math.round((record % 60 - seconds) * multiplier).toLocaleString("en-US", {
                minimumIntegerDigits: decimalPlaces,
                useGrouping: false
            });

            // return with following format: X[X...X]:XX:XX.X[X...X]
            return `${hours}:${minutes}:${seconds}.${decimals}`;
        }

        // otherwise, just return formatted record
        return numberWithCommas(record);
    };

    // FUNCTION 6: secondsToMinutes - convert a time from seconds to minutes
    // PRECONDITIONS (2 parameters):
    // 1.) record is a float number with at most three decimals places
    // 2.) type is either "score" or "time"
    // 3.) decimalPlaces is an integer, specifying how many decimal places we should round to, typically this is 2.
    // this parameter is only relevant when the type is "time"
    // POSTCONDITION (2 possible outcome):
    // if the type is time, we will compute the minuntes, seconds, and decimals, and return a string with the
    // following format: X[X...X]:XX.X[X...X]
    // if the type is score, return a string representing a formatted integer (includes commas)
    const secondsToMinutes = (record, type, decimalPlaces = 2) => {
        if (type === "time") {
            // calculate each unit of time
            record = parseFloat(record.toFixed(decimalPlaces));
            let time = Math.floor(record);
            let minutes = Math.floor(time / 60).toLocaleString("en-US", { minimumIntegerDigits: 1, useGrouping: false });
            let seconds = Math.floor(time % 60).toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });

            let multiplier = Math.pow(10, decimalPlaces);
            let decimals = Math.round((record % 60 - seconds) * multiplier).toLocaleString("en-US", {
                minimumIntegerDigits: decimalPlaces,
                useGrouping: false
            });

            // return with following format: X[X...X]:XX.X[X...X]
            return `${minutes}:${seconds}.${decimals}`;
        }

        // otherwise, just return formatted record
        return numberWithCommas(record);
    };

    // FUNCTION 7: recordB2F - ("record backend-to-frontend") convert record from back-end format to front-end format
    // PRECONDITION (3 parameters): 
    // 1.) record: a float number with at most two decimal places (should only have decimals if the type is "score")
    // 2.) type: a string, either "score" or "time"
    // 3.) timerType: a string representing the time of timer of the chart. only really relevent for time charts
    // POSTCONDITION (2 possible outcomes):
    // if the type is time, we convert to a suitable format based on the time type, convert to string, and return
    // if the type is score, return a string representing a formatted integer (includes commas)
    const recordB2F = (record, type, timerType) => {
        // first, take the absolute value of record
        const fixedRecord = Math.abs(record);

        // next, let's handle time records
        if (type === "time") {
            switch (timerType) {
                case "sec":
                    return Math.floor(fixedRecord);
                case "sec_csec":
                    return fixedRecord.toFixed(2);
                case "sec_msec":
                    return fixedRecord.toFixed(3);
                case "min":
                    return secondsToMinutes(fixedRecord, type).split(":")[0];
                case "min_sec":
                    return secondsToMinutes(fixedRecord, type).split(".")[0];
                case "min_sec_csec":
                    return secondsToMinutes(fixedRecord, type);
                case "min_sec_msec":
                    return secondsToMinutes(fixedRecord, type, 3);
                case "hour":
                    return secondsToHours(fixedRecord, type).split(":")[0];
                case "hour_min":
                    const splitTime = secondsToHours(fixedRecord, type).split(":");
                    return `${splitTime[0]}:${splitTime[1]}`;
                case "hour_min_sec":
                    return secondsToHours(fixedRecord, type).split(".")[0];
                case "hour_min_sec_csec":
                    return secondsToHours(fixedRecord, type);
                case "hour_min_sec_msec":
                    return secondsToHours(fixedRecord, type, 3);
                default:
                    return fixedRecord.toFixed(2);
            };
        }

        // finally, handle score records
        return numberWithCommas(fixedRecord);
    };

    // FUNCTION 8: getTimeAgo - given a timestamp, determine how long ago the timestamp occured given the current time
    // PRECONDITIONS (1 parameter):
    // 1.) timestamp: a string representing a timestamp, typically formatted in the PostgreSQL `timestamptz` format
    // POSTCONDITIONS (4 possible outcomes):
    // If the time between now and the timestamp is less than a minute, return string describing time difference in seconds
    // If the time between now and the timestamp is less than an hour, return string describing time difference in minutes
    // If the time between now and the timestamp is less than a day, return string describing time difference in hours
    // If the time between now and the timestamp is less than a month, return string describing time difference in days
    // If the time between now and the timestamp is less than a year, return the string describing the time difference in months
    // Otherwise, return the string describing the time difference in years
    const getTimeAgo = timestamp => {
        const submissionDate = new Date(timestamp);
        const formattedTimeAgo = formatDistanceToNowStrict(submissionDate, { addSuffix: true });
        return formattedTimeAgo;
    };

    // FUNCTION 9: runTypeB2F - ("run type backend-to-frontend") convert run type from backend to frontend format
    // PRECONDITIONS (1 parameter):
    // 1.) runType: a string, either "normal" or "tas"
    // POSTCONDITIONS (1 possible outcome):
    // if the run type is valid, it is manipulated in some way, and returned
    // otherwise, an empty string is returned
    const runTypeB2F = runType => {
        switch (runType) {
            case "normal":
                return capitalize(runType);
            case "tas":
                return runType.toUpperCase();
            default:
                return "";
        };
    };

    // FUNCTION 10: timerType2TimeUnit - ("timer type to timer unit") convers a timer type string to it's time unit
    // PRECONDITIONS (1 parameter):
    // 1.) timerType: a string representing the time of timer of the chart
    // POSTCONDITIONS (1 possible outcome):
    // the highest unit of time of the timer type is return as a string
    const timerType2TimeUnit = timerType => {
        if (["sec", "sec_csec", "sec_msec"].includes(timerType)) return "second";
        if (["min", "min_sec", "min_sec_csec", "min_sec_msec"].includes(timerType)) return "minute";
        if (["hour", "hour_min", "hour_min_sec", "hour_min_sec_csec", "hour_min_sec_msec"].includes(timerType)) return "hour";
        return undefined;
    };

    // FUCNTION 11: snakeToTitleWithDashes - converts a string in snake case to title case, including "dashed" words
    // PRECONDITIONS (1 parameter):
    // 1.) str: a string with snake case formatting
    // POSTCONDITIONS (1 possible outcome):
    // generally, the first letter of each word is capitalized, and underscores are replaced with spaces. however, if
    // the user wants to have an underscore, they can specify that with two underscores `__`, and this function will handle
    // that request. this function additionally handles "dashes", such that if a letter occurs after a dash, it's capitalized
    const snakeToTitleWithDashes = str => {
        const title = snakeToTitle(str);

        // logic for capitalizing letters after dashes
        let titleWithDashes = "";
        for (let i = 0; i < title.length; i++) {
            let c = title[i];
            if (i > 0 && title[i - 1] === "-" && isAlphaPattern.test(c)) {
                c = c.toUpperCase();
            }
            titleWithDashes += c;
        }

        return titleWithDashes;
    };

    // TODO: after timer rework, this function is no longer necessary
    // FUNCTION 12: timerTypeB2F - code that converts timerType from back-end format to more user-friendly front-end format
    // PRECONDITIONS (1 parameter):
    // 1.) timerType: a string representing a back-end-formatted timer_type enum type
    // POSTCONDITIONS (1 possible outcome):
    // the string is converted into a more understandable format for most users
    const timerTypeB2F = timerType => {
        const words = timerType.split("_");
        let fixedTimer = "";

        for (let i = 0; i < words.length; i++) {
            fixedTimer += words[i];
            if (i < words.length - 1) {
                if (["csec", "msec"].includes(words[i + 1])) {
                    fixedTimer += ".";
                } else {
                    fixedTimer += ":";
                }
            }
        }

        return fixedTimer.toUpperCase();
    };

    return {
        capitalize,
        snakeToTitle,
        dateB2F,
        numberWithCommas,
        secondsToHours,
        recordB2F,
        getTimeAgo,
        runTypeB2F,
        timerType2TimeUnit,
        snakeToTitleWithDashes,
        timerTypeB2F
    };
};

/* ===== EXPORTS ===== */
export default FrontendHelper;
