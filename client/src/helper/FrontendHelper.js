const FrontendHelper = () => {
    // FUNCTION 1: capitalize
    // Precondition: str is a string
    // Postcondition: str is returned with it's first letter capitalized
    const capitalize = str => {
        return str.charAt(0).toUpperCase()+str.slice(1);
    };

    // FUNCTION 2: cleanLevelName
    // PRECONDITION: takes string with following format:
    // word1_word2_..._(wordn)
    // POSTCONDITION: and transforms to following format:
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

    // FUNCTION 3: dateB2F ("date backend-to-frontend")
    // Precondition: the date parameter can take two possible states: a timestamptz formatted date, or null
    // Postcondition: if null, the function will return the current date. otherwise, the function will return the formatted date, 
    // converted to the client's location. output will have the following format: YYYY-MM-DD
    const dateB2F = date => {
        const d = date ? new Date(date) : new Date();
        const year = d.getFullYear();
        const month = ("0"+(d.getMonth()+1)).slice(-2);
        const day = ("0"+d.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    };

    // FUNCTION 4: recordB2F - convert record from back-end format to front-end format
    // PRECONDITION (2 parameters): 
    // 1.) record is a float number with at most two decimal places, OR it is undefined
    // 2.) type is either "score" or "time"
    // POSTCONDITION (1 parameter):
    // if the type is time, we fix the number of decimal places to two. a string is returned in this case.
    // if the type is score, simply return record, a float.
    const recordB2F = (record, type) => {
        if (record && type === "time") {
            return record.toFixed(2);
        }
        return record;
    };

    // FUNCTION 5: secondsToHours - convert a time from seconds to hours
    // PRECONDITIONS (2 parameters):
    // 1.) record is a float number with at most two decimals places
    // 2.) type is either "score" or "time"
    // POSTCONDITION (1 parameter):
    // if the type is time, we will compute the hours, minuntes, seconds, and centiseconds, and return a string with the
    // following format: XX:XX:XX.XX
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

        // otherwise, just return record
        return record;
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

    // FUNCTION 7: getTimeDifference - given a timestamp, determine how long ago the timestamp occured given the current time
    // PRECONDITIONS (1 parameter):
    // 1.) timestamp: a string representing a timestamp, typically formatted in the PostgreSQL `timestamptz` format
    // POSTCONDITIONS (4 possible outcomes):
    // If the time between now and the timestamp is less than a minute, return string describing time difference in seconds
    // If the time between now and the timestamp is less than an hour, return string describing time difference in minutes
    // If the time between now and the timestamp is less than a day, return string describing time difference in hours
    // Otherwise, return string describing time difference in days
    const getTimeDifference = timestamp => {
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

    return { capitalize, cleanLevelName, dateB2F, recordB2F, secondsToHours, getTimeDifference };
};

export default FrontendHelper;