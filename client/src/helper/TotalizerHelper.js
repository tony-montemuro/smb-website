const TotalizerHelper = () => {

    // FUNCTION 1: createTotalMaps
    // PRECONDITIONS (4 parameters): 
    // 1.) submissions: an array containing all the submissions for a particular game
    // 2.) miscStatus: a boolean value representing whether or not to map miscellaneous submissions
    // 3.) type: a string value that can be one of two values: "score" or "time"
    // 4.) timeTotal: the sum of all level times for a particular game
    // POSTCONDITIONS (2 returns):
    // 1.) allTotalsMap: an object representing a map with the following key value pair:
    //               userId -> (total of ALL scores)
    // 2.) liveTotalMap: an object representing a map with the following key value pair:
    //               userId -> (total of ONLY LIVE scores)
    // ALSO, submissions will be empty!!!!
    const createTotalMaps = (submissions, miscStatus, type, timeTotal) => {
        const allTotalsMap = {}, liveTotalsMap = {};
        while (submissions.length > 0) {
            const submission = submissions.pop();

            // first, extract values from submission object
            const userId = submission.profiles.id;
            const value = type === "score" ? submission.score : -Math.abs(submission.time);
            const name = submission.profiles.username;
            const country = submission.profiles.country;
            const avatar_url = submission.profiles.avatar_url;

            // next, update the allTotals list
            if (userId in allTotalsMap) {
                allTotalsMap[userId]["total"] += value
            } else {
                allTotalsMap[userId] = { user_id: userId, name: name, country: country, avatar_url: avatar_url, total: type === "score" ? value : timeTotal + value };
            }

            // finally, update the liveTotals list
            if (submission.live) {
                if (userId in liveTotalsMap) {
                    liveTotalsMap[userId]["total"] += value
                } else {
                    liveTotalsMap[userId] = { user_id: userId, name: name, country: country, avatar_url: avatar_url, total: type === "score" ? value : timeTotal + value };
                }
            }
        }
        return { allTotalsMap: allTotalsMap, liveTotalsMap: liveTotalsMap };
    };

    const getTotalMaps = (submissions, type, timeTotal) => {
        // create both the live and all maps, empty objects to start
        const allTotalsMap = {}, liveTotalsMap = {};

        // loop through all the submissions, and generate maps based on the data
        submissions.forEach(submission => {
            // first, extract information from the submission object
            const user = submission.user;
            const userId = user.id, name = user.username, country = user.country, avatar_url = user.avatar_url;
            const record = type === "score" ? submission.details.record : -Math.abs(submission.details.record);
            
            // next, update the allTotals list
            if (userId in allTotalsMap) {
                allTotalsMap[userId].total += record
            } else {
                allTotalsMap[userId] = { 
                    user_id: userId, 
                    name: name, 
                    country: country, 
                    avatar_url: avatar_url, 
                    total: type === "score" ? record : timeTotal + record
                };
            }

            // finally, update the liveTotals list
            if (submission.details.live) {
                if (userId in liveTotalsMap) {
                    liveTotalsMap[userId]["total"] += record
                } else {
                    liveTotalsMap[userId] = { 
                        user_id: userId, 
                        name: name, 
                        country: country, 
                        avatar_url: avatar_url, 
                        total: type === "score" ? record : timeTotal + record
                    };
                }
            }
        });
        return { newAllTotalsMap: allTotalsMap, newLiveTotalsMap: liveTotalsMap };
    };

    // FUNCTION 2: addPositionToTotals
    // PRECONDITIONS (2 parameters): 
    // 1.) totals: an array of user objects sorted in descending order by total
    // 2.) isTime: a boolean variable used to determine if the mode is score or time
    // POSTCONDITIONS (0 returns):
    // for each object in totals, a new field is added: position.
    const addPositionToTotals = (totals, isTime) => {
        // variables used to determine position of each submission
        let trueCount = 1;
        let posCount = trueCount;

        // now, iterate through each record, and calculate the position.
        for (let i = 0; i < totals.length; i++) {
            const total = totals[i];
            total["position"] = posCount;
            trueCount++;
            if (i < totals.length-1 && totals[i+1]["total"] !== total["total"]) {
                posCount = trueCount;
            }

            if (isTime) {
                let hours = 0, minutes = 0, seconds = 0, centiseconds = 0;
                let totalTime = total.total;

                // 3600 seconds in 1 hour
                while (totalTime >= 3600) {
                    totalTime -= 3600;
                    hours++;
                }

                // 60 seconds in 1 minute
                while (totalTime >= 60) {
                    totalTime -= 60;
                    minutes++;
                }

                // with the remaining time, we can calculate the number of seconds and centiseconds
                seconds = Math.floor(totalTime);
                centiseconds = (totalTime - seconds) * 100;

                // finally, convert to a specialized string, which will automatically append a leading 0 to single
                // digit units of time
                total["hours"] = hours.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
                total["minutes"] = minutes.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
                total["seconds"] = seconds.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
                total["centiseconds"] = centiseconds.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
            }
        }
    };

    const insertPositionToTotals = (totals, type) => {
        // variables used to determine position of each submission
        let trueCount = 1, posCount = trueCount;

        // iterate through the list of totals, and calculate the position
        totals.forEach((total, index) => {
            // add position field
            total.position = posCount;
            trueCount++;

            // if the next element exists and has a different total than the current total, update posCount
            if (index < totals.length-1 && totals[index+1].total !== total.total) {
                posCount = trueCount;
            }

            // finally, if we are dealing with time totals, we need to convert the following:
            // seconds -> hours:minutes:seconds:centiseconds (XX:XX:XX.XX)
            if (type === "time") {
                // calculate each unit of time
                let time = total.total;
                let hours = Math.floor(time/3600);
                let minutes = Math.floor((time%3600)/60);
                let seconds = Math.floor(time%60);
                let centiseconds = Math.round((time%60-seconds)*100);

                // add each field to the total object
                total.hours = hours.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
                total.minutes = minutes.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
                total.seconds = seconds.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
                total.centiseconds = centiseconds.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
            }
        });
    };

    return { createTotalMaps, getTotalMaps, addPositionToTotals, insertPositionToTotals };
}

export default TotalizerHelper;