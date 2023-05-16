const MedalsHelper = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: getUserMap - generate a mapping of users
    // PRECONDITIONS (1 parameter): 
    // 1.) submissions: an array containing filtered submissions for a particular game
    // POSTCONDITIONS (1 possible outcome):
    // 1.) userMap: an object representing a map with the following key value pair:
    //                   profile_id -> profile information, platinum, gold, silver, bronze
    const getUserMap = (submissions) => {
        // initialize variables
        const userMap = {};
        const uniqueIds = [];

        // now, create the user map from the submission parameter
        submissions.forEach(submission => {
            const profileId = submission.profile.id;
            if (!uniqueIds.includes(profileId)) {
                userMap[profileId] = {
                    profile: submission.profile,
                    bronze: 0,
                    silver: 0,
                    gold: 0,
                    platinum: 0
                };
                uniqueIds.push(profileId);
            }
        });

        return userMap;
    };

    // FUNCTION 2: createMedalTable
    // PRECONDITIONS (2 parameters): 
    // 1.) userMap: an object representing a map with the following key value pair:
    //              user_id -> platinum, gold, silver, bronze
    // 2.) submissions: an array containing filtered submissions for a particular game. the submissions must be
    // ordered by type in descending order, then by level id in ascending order
    // POSTCONDITIONS (1 possible outcome):
    // 1.) an array: the values of the userMap sorted by the following fields (ordered by sorting order) in descending order: 
    // platinum, gold, silver, bronze
    const getMedalTable = (userMap, submissions) => {
        // initialize two variables: an iterator variable, and a variable to store the length of the submissions array
        let i = 0;
        const sLength = submissions.length;

        // iterate through all the submissions
        while (i < sLength) {
            // define variables
            const levelId = submissions[i].level.id;
            let j = 1, prev = "", finished = false;

            // iterate through all submissions for a particular level
            while (!finished) {
                // define commonly referenced variables for the current submission
                const currRecord = submissions[i].details.record;
                const currUser = submissions[i].profile.id;

                // case 1: first record. it can be either platinum, or gold. a platinum is awarded in the following cases:
                // 1.) the submission is better than any other submission for a particular level (condition 3 of if statement)
                // 2.) the submission is the only one for a particular level (condition 1 and 2)
                // otherwise, the submission will be awarded a gold medal
                if (j === 1) {
                    if (i+1 === sLength || submissions[i+1].level.id !== levelId || currRecord > submissions[i+1].details.record) {
                        userMap[currUser].platinum++;
                        prev = "platinum"
                    } else {
                        userMap[currUser].gold++;
                        prev = "gold";
                    }

                // case 2: second record. it can be either gold or silver. because the first submission is special (platinum medals), we can
                // logically conclude the second submission's medal simply based on whether or not the first submission was platinum or gold
                } else if (j === 2) {
                    if (prev === "platinum") {
                        userMap[currUser].silver++;
                        prev = "silver";
                    } else {
                        userMap[currUser].gold++;
                        prev = "gold";
                    }

                // case 3: the third or more record. it can be either gold, silver, or bronze. this is dependent on the prev variable
                } else {
                    if (prev === "gold") {
                        if (currRecord === submissions[i-1].details.record) {
                            userMap[currUser].gold++;
                        } else {
                            userMap[currUser].silver++;
                            prev = "silver";
                        }
                    } else if (prev === "silver") {
                        if (currRecord === submissions[i-1].details.record) {
                            userMap[currUser].silver++;
                        } else {
                            userMap[currUser].bronze++;
                            prev = "bronze";
                        }
                    } else {
                        if (currRecord === submissions[i-1].details.record) {
                            userMap[currUser].bronze++;
                        } else {
                            finished = true;
                        }
                    }
                }

                // now, we need to add this code for the following edge cases:
                // 1.) the current submission is the final submission in the submissions array
                // 2.) the current submission is the final submission for this particular level
                if (i+1 === sLength || submissions[i+1].level.id !== levelId) {
                    finished = true;
                }

                // increment i and j
                i++;
                j++;
            }

            // generally speaking, there will be many submissions in the submissions list that are not awarded any medals
            // in this case, we want to simply iterate through the submissions list until either we have run out of submissions,
            // or we find a submission with a new level id. sometimes this loop is never run, if all submissions for a level are awarded a medal
            while (i < sLength && submissions[i].level.id === submissions[i-1].level.id) {
                i++;
            }
        }
        
        // now, let's covert the map of medal table objects into an ordered array of medal table objects, based on the medal counts
        // of each user, with a position field added to each element as well. return this array.
        return Object.values(userMap).sort((a, b) => b.platinum-a.platinum || b.gold-a.gold || b.silver-a.silver || b.bronze-a.bronze);
    };

    // FUNCTION 3: insertPositionToMedals
    // PRECONDITIONS (1 parameter): 
    // 1.) medalTable: an array of user objects sorted in descending order by platinum, then gold, then silver, then bronze
    // POSTCONDITIONS (1 possible outcome):
    // for each object in medalTable, a new field is added: position.
    const insertPositionToMedals = (medalTable) => {
        // variables used to determine position of each submission, and an array of all medal types
        let trueCount = 1, posCount = trueCount;
        const medals = ["platinum", "gold", "silver", "bronze"];

        // now, iterate through each entry, and calculate the position
        medalTable.forEach((row, index) => {
            row.position = posCount;
            trueCount++;

            // the posCount will get updated if the current row is NOT the final row, and the next row
            // has differing medal counts
            if (index < medalTable.length-1 && medals.some(medal => medalTable[index+1][medal] !== row[medal])) {
                posCount = trueCount;
            }
        });
    };

    return { getUserMap, getMedalTable, insertPositionToMedals };
};

/* ===== EXPORTS ===== */
export default MedalsHelper;