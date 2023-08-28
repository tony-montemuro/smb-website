const TotalizerHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: calculateTotalTime - calculate the sum of all times for every level in a game with a time chart
    // PRECONDITIONS (2 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) category: a string representing a valid category
    // POSTCONDITIONS (1 return):
    // 1.) total: a floating point value that is the sum of each level with a time chart
    const calculateTotalTime = (game, category) => {
        // define a variable to store the total
        let total = 0;
        
        // for each game
        game.mode.forEach(mode => {

            // we only want to consider levels that are part of the category defined by the category parameter
            if (mode.category === category) {

                // for each mode
                mode.level.forEach(level => {

                    // we only want to consider levels that have time charts
                    total += ["time", "both"].includes(level.chart_type) ? level.time : 0;
                });
            }
        });
        
        return total;
    };

    // FUNCTION 2: getTotalMaps - generate a mapping of users
    // PRECONDITIONS (3 parameters): 
    // 1.) submissions: an array containing filtered submissions for a particular game
    // 2.) type: a string value that can be one of two values: "score" or "time"
    // 3.) timeTotal: the sum of all level times for a particular game
    // POSTCONDITIONS (2 returns):
    // 1.) allTotalsMap: an object representing a map with the following key value pair:
    //               profileId -> profile info AND total of ALL scores
    // 2.) liveTotalMap: an object representing a map with the following key value pair:
    //               profileId -> profile info AND total of ONLY LIVE scores
    const getTotalMaps = (submissions, type, timeTotal) => {
        // create both the live and all maps, empty objects to start
        const allTotalsMap = {}, liveTotalsMap = {};

        // loop through all the submissions, and generate maps based on the data
        submissions.forEach(submission => {
            // first, extract information from the submission object
            const profile = submission.profile;
            const profileId = profile.id;
            const record = type === "score" ? submission.record : -Math.abs(submission.record);
            
            // next, update the allTotals list
            if (profileId in allTotalsMap) {
                allTotalsMap[profileId].total += record
            } else {
                allTotalsMap[profileId] = { 
                    profile: profile,
                    total: type === "score" ? record : timeTotal + record
                };
            }

            // finally, update the liveTotals list
            if (submission.live) {
                if (profileId in liveTotalsMap) {
                    liveTotalsMap[profileId].total += record
                } else {
                    liveTotalsMap[profileId] = { 
                        profile: profile, 
                        total: type === "score" ? record : timeTotal + record
                    };
                }
            }
        });

        return { allTotalsMap: allTotalsMap, liveTotalsMap: liveTotalsMap };
    };

    // FUNCTION 3: sortTotals - sort total objects based on the total field
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

    // FUNCTION 4: insertPositionToTotals - function that calculates the position and adds it as a property to each total object 
    // in `totals`
    // PRECONDITIONS (2 parameters): 
    // 1.) totals: an array of totals objects sorted in descending order by total field
    // POSTCONDITIONS (1 possible outcome):
    // for each object in totals, a new field is added: position.
    const insertPositionToTotals = totals => {
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

    return { calculateTotalTime, getTotalMaps, sortTotals, insertPositionToTotals };
};

/* ===== EXPORTS ===== */
export default TotalizerHelper;