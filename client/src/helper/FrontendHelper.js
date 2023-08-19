/* ===== IMPORTS ===== */
import { formatDistanceToNowStrict } from 'date-fns';

const FrontendHelper = () => {
    /* ===== FUNCTIONS ===== */

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

    // FUNCTION 4: secondsToHours - convert a time from seconds to hours
    // PRECONDITIONS (2 parameters):
    // 1.) record is a float number with at most two decimals places
    // 2.) type is either "score" or "time"
    // POSTCONDITION (2 possible outcome):
    // if the type is time, we will compute the hours, minuntes, seconds, and centiseconds, and return a string with the
    // following format: [X...X]X:XX:XX.XX
    // if the type is score, return a string representing a formatted integer (includes commas)
    const secondsToHours = (record, type) => {
        if (type === "time") {
            // calculate each unit of time
            let time = Math.floor(record);
            let hours = Math.floor(time/3600).toLocaleString('en-US', { minimumIntegerDigits: 1, useGrouping: false });
            let minutes = Math.floor((time%3600)/60).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
            let seconds = Math.floor(time%60).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
            let centiseconds = Math.round((record%60-seconds)*100).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });

            // return with following format: XX:XX:XX.XX
            return `${ hours }:${ minutes }:${ seconds }.${ centiseconds }`;
        }

        // otherwise, just return formatted record
        return record.toLocaleString("en-US");
    };

    // FUNCTION 5: secondsToMinutes - convert a time from seconds to minutes
    // PRECONDITIONS (2 parameters):
    // 1.) record is a float number with at most two decimals places
    // 2.) type is either "score" or "time"
    // POSTCONDITION (2 possible outcome):
    // if the type is time, we will compute the minuntes, seconds, and centiseconds, and return a string with the
    // following format: [X...X]X:XX.XX
    // if the type is score, return a string representing a formatted integer (includes commas)
    const secondsToMinutes = (record, type) => {
        if (type === "time") {
            // calculate each unit of time
            let time = Math.floor(record);
            let minutes = Math.floor(time/60).toLocaleString('en-US', { minimumIntegerDigits: 1, useGrouping: false });
            let seconds = Math.floor(time%60).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
            let centiseconds = Math.round((record%60-seconds)*100).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });

            // return with following format: XX:XX:XX.XX
            return `${ minutes }:${ seconds }.${ centiseconds }`;
        }

        // otherwise, just return formatted record
        return record.toLocaleString("en-US");
    };

    // FUNCTION 6: recordB2F - ("record backend-to-frontend") convert record from back-end format to front-end format
    // PRECONDITION (2 parameters): 
    // 1.) record is a float number with at most two decimal places (should only have decimals if the type is "score")
    // 2.) type is either "score" or "time"
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
                case "min":
                    return secondsToMinutes(fixedRecord, type).split(":")[0];
                case "min_sec":
                    return secondsToMinutes(fixedRecord, type).split(".")[0];
                case "min_sec_csec":
                    return secondsToMinutes(fixedRecord, type);
                case "hour":
                    return secondsToHours(fixedRecord, type).split(":")[0];
                case "hour_min":
                    const splitTime = secondsToHours(fixedRecord, type).split(":");
                    return `${ splitTime[0] }:${ splitTime[1] }`;
                case "hour_min_sec":
                    return secondsToMinutes(fixedRecord, type).split(".")[0];
                case "hour_min_sec_csec":
                    return secondsToHours(fixedRecord, type);
                default:
                    return fixedRecord.toFixed(2);
            };
        }

        // finally, handle score records
        return fixedRecord.toLocaleString("en-US");
    };

    // FUNCTION 7: getTimeAgo - given a timestamp, determine how long ago the timestamp occured given the current time
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

    // FUNCTION 8: categoryB2F - ("category backend-to-frontend") convert category from back-end format to front-end format
    // PRECONDITIONS (1 parameter):
    // 1.) category: a string representing a valid category [main, misc, normal, story, challenge, or party]
    // POSTCONDITIONS (2 possible outcome):
    // if category is a valid category, the category is transformed into the readable name
    // otherwise, an empty string is returned
    const categoryB2F = category => {
        switch (category) {
            case "main":
                return "Practice Mode";
            case "misc":
                return "Miscellaneous Practice Mode";
            case "normal":
                return "Normal Mode";
            case "story":
                return "Story Mode";
            case "challenge":
                return "Challenge Mode";
            case "party":
                return "Party Games";
            default:
                return "";
        };
    };

    return { capitalize, cleanLevelName, dateB2F, secondsToHours, recordB2F, getTimeAgo, categoryB2F };
};

export default FrontendHelper;