const TotalizerHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: getTotalMaps - generate a mapping of users
    // PRECONDITIONS (3 parameters): 
    // 1.) submissions: an array containing filtered submissions for a particular game
    // 2.) type: a string value that can be one of two values: "score" or "time"
    // 3.) timeTotal: the sum of all level times for a particular game
    // POSTCONDITIONS (2 returns):
    // 1.) allTotalsMap: an object representing a map with the following key value pair:
    //               userId -> (total of ALL scores)
    // 2.) liveTotalMap: an object representing a map with the following key value pair:
    //               userId -> (total of ONLY LIVE scores)
    const getTotalMaps = (submissions, type, timeTotal) => {
        // create both the live and all maps, empty objects to start
        const allTotalsMap = {}, liveTotalsMap = {};

        // loop through all the submissions, and generate maps based on the data
        submissions.forEach(submission => {
            // first, extract information from the submission object
            const user = submission.user;
            const userId = user.id;
            const record = type === "score" ? submission.details.record : -Math.abs(submission.details.record);
            
            // next, update the allTotals list
            if (userId in allTotalsMap) {
                allTotalsMap[userId].total += record
            } else {
                allTotalsMap[userId] = { 
                    user: user,
                    total: type === "score" ? record : timeTotal + record
                };
            }

            // finally, update the liveTotals list
            if (submission.details.live) {
                if (userId in liveTotalsMap) {
                    liveTotalsMap[userId].total += record
                } else {
                    liveTotalsMap[userId] = { 
                        user: user, 
                        total: type === "score" ? record : timeTotal + record
                    };
                }
            }
        });

        return { allTotalsMap: allTotalsMap, liveTotalsMap: liveTotalsMap };
    };

    // FUNCTION 2: sortTotals - sort total objects based on the total field
    // PRECONDITIONS (3 parameters):
    // 1.) all: a mapping of totals objects
    // 2.) live: a mapping of totals objects, but only including live submissions
    // 3.) type: a string, either "time" or "score"
    // POSTCONDITIONS (2 returns):
    // 1.) allTotals: an array of totals objects sorted by total attribute
    // 2.) liveTotals: an array of totals objects sorted by total attribute
    const sortTotals = (all, live, type) => {
        let allTotals = [], liveTotals = [];
        if (type === "score") {
            allTotals = Object.values(all).sort((a, b) => a.total > b.total ? -1 : 1);
            liveTotals = Object.values(live).sort((a, b) => a.total > b.total ? -1 : 1);
        } else {
            allTotals = Object.values(all).sort((a, b) => b.total > a.total ? -1 : 1);
            liveTotals = Object.values(live).sort((a, b) => b.total > a.total ? -1 : 1);
        }
        return { allTotals: allTotals, liveTotals: liveTotals };
    };

    // FUNCTION 3: insertPositionToTotals
    // PRECONDITIONS (2 parameters): 
    // 1.) totals: an array of totals objects sorted in descending order by total field
    // 2.) type: a string, either "time" or "score"
    // POSTCONDITIONS (0 returns):
    // for each object in totals, a new field is added: position.
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
        });
    };

    return { getTotalMaps, sortTotals, insertPositionToTotals };
};

/* ===== EXPORTS ===== */
export default TotalizerHelper;