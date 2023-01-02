const MedalsHelper = () => {

    // FUNCTION 1: createTotalMaps
    // PRECONDITIONS (1 parameter): 
    // 1.) submissions: an array containing all the submissions for a particular game, with either misc or
    // main levels already pre-filtered
    // POSTCONDITIONS (1 returns):
    // 1.) userMap: an object representing a map with the following key value pair:
    //                   user_id -> platinum, gold, silver, bronze
    // submissions gets sorted by level id in this function!
    const createUserMap = (submissions) => {
        // initialize variables
        const userMap = {};
        const uniqueIds = [];

        // first, sort the submission array by level id
        submissions = submissions.sort((a, b) => b.level.id > a.level.id ? -1 : 1);

        // next, let's generate medal table object for each user who has submitted to
        // the game defined by abb
        const medalTableObjects = submissions.map(obj => ({
            user_id: obj.profiles.id,
            name: obj.profiles.username,
            country: obj.profiles.country,
            avatar_url: obj.profiles.avatar_url,
            bronze: 0,
            silver: 0,
            gold: 0,
            platinum: 0
            })).filter(element => {
                if (!uniqueIds.includes(element.user_id)) {
                    uniqueIds.push(element.user_id);
                    return true;
                }
                return false;
            });

        // now, we are going to map each object to the id field. this will
        // be important when calculating number of each medal type
        medalTableObjects.forEach(obj => {
            userMap[obj.user_id] = obj;
        });

        return userMap;
    }

    // FUNCTION 2: createMedalTable
    // PRECONDITIONS (3 parameters): 
    // 1.) userMap: an object representing a map with the following key value pair:
    //              user_id -> platinum, gold, silver, bronze
    // 2.) submissions: an array containing all the submissions for a particular game, with either misc or
    // main levels already pre-filtered. ordered by type in descending order, then by level id in ascending order
    // 3.) type: a string with two possible values: "score" or "time"
    // POSTCONDITIONS (1 returns):
    // 1.) the values of the userMap sorted by bronze, then silver, then gold, then platinum (in descending order)
    const createMedalTable = (userMap, submissions, type) => {
        let i = 0;
        while (i < submissions.length) {
            const levelId = submissions[i].level.id;
            let j = 1, prev = "", finished = false;
            while (!finished) {
                const currRecord = submissions[i][type];
                const currUser = submissions[i].profiles.id;
                // case 1: first record. it can be either platinum, or gold
                if (j === 1) {
                    if (i+j >= submissions.length || submissions[i+j].level.id !== levelId || currRecord > submissions[i+j][type]) {
                        userMap[currUser].platinum++;
                        prev = "platinum"
                    } else {
                        userMap[currUser].gold++;
                        prev = "gold";
                    }

                // case 2: second record. it can be either gold or silver. this is dependent on the status of the first record
                } else if (j === 2) {
                    if (prev === "platinum") {
                        userMap[currUser].silver++;
                        prev = "silver";
                    } else {
                        userMap[currUser].gold++;
                        prev = "gold";
                    }

                // case 3: the third or more record. it can be either gold, silver, or bronze. this is dependent on the status
                // of the previous record
                } else {
                    if (prev === "gold") {
                        if (currRecord === submissions[i-1][type]) {
                            userMap[currUser].gold++;
                        } else {
                            userMap[currUser].silver++;
                            prev = "silver";
                        }
                    } else if (prev === "silver") {
                        if (currRecord === submissions[i-1][type]) {
                            userMap[currUser].silver++;
                        } else {
                            userMap[currUser].bronze++;
                            prev = "bronze";
                        }
                    } else {
                        if (currRecord === submissions[i-1][type]) {
                            userMap[currUser].bronze++;
                        } else {
                            finished = true;
                        }
                    }
                }

                // now, we need to add this code for edge cases. normally won't resolve to true
                if (i+j >= submissions.length || submissions[i+1].level.id !== levelId) {
                    finished = true;
                }
                i++;
                j++;
            }
            
            // we now need to iterate i until submission[i]'s level id is different from the previous,
            // or until we have reached the end of the submissions array
            while (i < submissions.length && submissions[i].level.id === submissions[i-1].level.id) {
                i++;
            }
        }

        // now, let's covert the map of medal table objects into an ordered list of medal table objects, based on the medal counts
        // of each user, with a position field added to each element as well. return this array.
        return Object.values(userMap).sort((a, b) => b.platinum-a.platinum || b.gold-a.gold || b.silver-a.silver || b.bronze-a.bronze);
    }

    // FUNCTION 2: addPositionToMedals
    // PRECONDITIONS (2 parameters): 
    // 1.) medalTable: an array of user objects sorted in descending order by platinum, then gold, then silver, then bronze
    // POSTCONDITIONS (0 returns):
    // for each object in totals, a new field is added: position.
    const addPositionToMedals = (medalTable) => {
        // variables used to determine position of each submission
        let trueCount = 1;
        let posCount = trueCount;

        // now, iterate through each entry, and calculate the position.
        for (let i = 0; i < medalTable.length; i++) {
            const entry = medalTable[i];
            entry["position"] = posCount;
            trueCount++;
            if (
                i < medalTable.length-1 &&
                (
                    medalTable[i+1]["platinum"] !== entry["platinum"] ||
                    medalTable[i+1]["gold"] !== entry["gold"] ||
                    medalTable[i+1]["silver"] !== entry["silver"] ||
                    medalTable[i+1]["bronze"] !== entry["bronze"]
                )
            ){
                posCount = trueCount;
            }
        }
    }

    return { createUserMap, createMedalTable, addPositionToMedals };
}

export default MedalsHelper;