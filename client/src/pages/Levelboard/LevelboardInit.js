import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

// global variables
let correctedId = null;

const LevelboardInit = () => {
    // variable
    const initialValues = { record: "", monkeyId: 1, isLive: true, proof: "", comment: "" };
    
    // helper function used to capitalize an input string called str
    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // navigate used for redirecting
    const navigate = useNavigate();

    // path variables
    const path = window.location.pathname;
    const pathArr = path.split("/");
    const abb = pathArr[2];
    const mode = capitalize(pathArr[3]);
    const levelId = parseInt(pathArr[4]);

    // states
    const [records, setRecords] = useState([]);
    const [allRecords, setAllRecords] = useState([]);
    const [timeDefaultVal, setTimeDefaultVal] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [title, setTitle] = useState("");
    const [levelList, setLevelList] = useState([]);
    const [levelLength, setLevelLength] = useState(null);
    const [modeList, setModeList] = useState([]);
    const [specialIdList, setSpecialIdList] = useState([]);
    const [monkeyList, setMonkeyList] = useState([]);
    const [isMod, setIsMod] = useState(false);
    const [formValues, setFormValues] = useState(initialValues);
    const [formErrors, setFormErrors] = useState({});
    const [currentRecordData, setCurrentRecordData] = useState({});
    const [hasUserSubmitted, setHasUserSubmitted] = useState(false);
    const [totals, setTotals] = useState({});
    const [allTotals, setAllTotals] = useState({});
    const [medalTable, setMedalTable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmit, setIsSubmit] = useState(false);
    const [popup, setPopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // HELPER FUNCTIONS

    // helper function that converts a normal string to one in snake case
    const toSnake = (str) => {
        str = str.toLowerCase();
        str = str.replace(' ', '_');
        return str;
    };

    // helper function that will check if game name ends with 'misc'. if so, it will return the string
    // with the misc sliced off. otherwise, str is simply returned.
    // a bit of information about the returnMode param:
    // normalize: this will simply return the game abb WITHOUT the misc, if abb includes "misc"
    // underline: this will add an underline between the game abb and "misc"
    const miscCheckAndUpdate = (str, returnMode) => {
        if (str.slice(-4) === "misc") {
            if (returnMode === "normalize") {
                return str.slice(0, -4);
            }
            else if (returnMode === "underline") {
                return str.slice(0, -4) + "_" + str.slice(-4);
            }
            else {
                // just in-case
                return str.slice(0, -4);
            }
        } else {
            return str;
        }
    }

    // helper function which takes an array of records, and calculates the position of each record
    const addPosCol = (r) => {
        // variables used to determine position of each submission
        let trueCount = 1;
        let posCount = trueCount;

        // now, iterate through each record, and calculate the position.
        // simplify each object.
        for (let i = 0; i < r.length; i++) {
            let record = r[i];
            record["Position"] = posCount;
            trueCount++;
            if (i < r.length-1 && r[i+1][mode] !== record[mode]) {
                posCount = trueCount;
            }
        }

        console.log(r);

        return r;
    }

    // helper function that will query either the total or all total table for the particular game, based on the
    // isAll flag
    const queryTotals = async (isAll, prefix, userId, defaultVal) => {
        try {
            console.log(defaultVal);
            const tableName = isAll ? `${prefix}_total_all` : `${prefix}_total`;
            // query the entire total table for the particular game
            let { data: totals, error, status } = await supabase
                .from(tableName)
                .select("*");

            if (error && status !== 406) {
                throw error;
            }

            // now, check to see if current user's id is found in the table
            let found = false;
            totals.forEach(totalRow => {
                if (totalRow.user_id === userId) {
                    found = true;
                }
            });

            // special case that occurs if user has never submitted to a category. create a new
            // entry in the table for them. do this for the medal table as well.
            console.log(isAll ? "All Total: " : "Totals: ");
            if (!found) {
                try {
                    const { error } = await supabase
                        .from(tableName)
                        .insert({ 
                            user_id: userId,
                            total: defaultVal
                        });

                    if (error) {
                        throw error;
                    }

                    // update the totals array with this new object
                    totals.push({ user_id: userId, total: defaultVal });

                } catch (error) {
                    // Error code 23503 occurs when the user has signed up to the website, but has not yet created a profile
                    if (error.code === '23503') {
                        console.log("Failed to create new entry into table because user has not created their profile.");
                    } else {
                        console.log(error);
                        alert(error.message);
                    }
                }
            }

            // finally, create a key -> value relationship between userId -> total. this will be useful when we update the totalizer upon
            // user submission
            let totalsObj = {};
            totals.forEach(total => {
                totalsObj[total.user_id] = total.total;
            });
            console.log(totalsObj);
            isAll ? setAllTotals(totalsObj) : setTotals(totalsObj);

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    }

    // helper function that will query a levelboard for records, and clean up the data.
    const queryRecordsAndClean = async () => {
        // declare variables
        let r = [];
        const id = correctedId === null ? levelId : correctedId;
        const gameAbb = miscCheckAndUpdate(abb, "underline");
        
        // now, perform query
        try {
            let { data: records, error, status } = await supabase
                .from(`${gameAbb}_${id}`)
                .select(`
                    user_id,
                    profiles:user_id ( username, country, avatar_url ),
                    ${mode},
                    monkey:monkey_id ( id, monkey_name ),
                    Day,
                    Month,
                    Year,
                    Proof,
                    live,
                    Comment
                `)
                .order(`${mode}`, { ascending: false })
                .order("Year", { ascending: true })
                .order("Month", { ascending: true })
                .order("Day", { ascending: true });
                

            if (error && status !== 406) {
                throw error;
            }

            // if querying a time chart, we need to fix it so that each time has two
            // decimal places.
            if (mode === "Time") {
                for (let record of records) {
                    record.Time = record.Time.toFixed(2);
                }
            }

            // simplify
            for (let record of records) {
                record["Monkey"] = record.monkey.monkey_name;
                record["Name"] = record.profiles.username;
                record["Avatar_URL"] = record.profiles.avatar_url;
                record["Country"] = record.profiles.country;
                delete record.profiles;
            }

            r = records;

        } catch (error) {
            if (error.code === "PGRST200") {
                navigate("/");
            } else {
                alert(error.message);
            }
        } finally {
            return r;
        }
    }

    // helper function used to query the modes
    const queryModes = async () => {
        // initialize variables
        let list = [];
        const gameAbb = miscCheckAndUpdate(abb, "underline");

        try {
            let {data: modes, error, status} = await supabase
                .from(`${gameAbb}_modes`)
                .select("name");

            if (error && status !== 406) {
                throw error;
            }

            // now, we can extract the data from the query into a list of modes
            for (let mode of modes) {
                list.push(mode.name);
            }

            setModeList(list);
            return list;

        } catch(error) {
            alert(error.message);
        }
    }

    // helper function that adds levels to levelList state from the mode parameter
    const addLevels = async (mode) => {
        // initalize variables
        const gameAbb = miscCheckAndUpdate(abb, "underline");

        try {
            let {data: levels, error, status} = await supabase
                .from(`${gameAbb}_${toSnake(mode)}`)
                .select("id, name")
                .order("id");

            if (error && status !== 406) {
                throw error;
            }

            // now, we can extract the name of each level from the data returned from the api call
            // into the levelList state
            levels.forEach((level) => {
                setLevelList(levelList => [...levelList, level.name]);
            });

        } catch(error) {
            throw (error.message);
        }
    }

    // function that will submit user's record to the levelboard
    const submitRecord = async (userId, gameAbb) => {
        // initalize variables
        const date = new Date();
        const id = correctedId === null ? levelId : correctedId;

        try {
            const { error } = await supabase
                .from(`${gameAbb}_${id}`)
                .upsert({ 
                    user_id: userId,
                    [mode]: formValues.record,
                    monkey_id: formValues.monkeyId,
                    Day: date.getDate(),
                    Month: date.getMonth()+1,
                    Year: date.getFullYear(),
                    Proof: formValues.proof,
                    live: formValues.isLive,
                    Comment: formValues.comment
                }, {
                    returning: "minimal", // Don't return the value after inserting
                }, { 
                    onConflict: "user_id"
                });

            if (error) {
                throw error;
            }

            updateMedalTable(gameAbb);
            
        } catch (error) {
            if (error.code === "23503") {
                // error code 23503 occurs when a user has authenticated themselves, but not created
                // a profile
                alert("Error! You have not set up your profile yet. Please go to the top right of the page, and set up your profile to begin submitting.");
            } else {
                console.log(error);
                alert(error.message);
            }
        }
    }

    // function that will submit a new record to the recent submissions table
    const submitToRecent = async (userId) => {
        // initalize variables used in query
        const gameAbb = miscCheckAndUpdate(abb, "normalize");
        const isMisc = abb.includes("misc") ? true : false;
        
        try {
            const { error } = await supabase
                .from(`${gameAbb}_recent_submissions`)
                .insert([{
                    user_id: userId,
                    level_name: title,
                    level_id: levelId,
                    record: parseFloat(formValues.record),
                    live: formValues.isLive,
                    proof: formValues.proof,
                    comment: formValues.comment,
                    isScore: mode === "Score" ? true : false,
                    isMisc: isMisc
                }], {
                    returning: "minimal", // Don't return the value after inserting
                });

            if (error) {
                throw error;
            }
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    }

    // function that will remove userId's record from the leaderboard
    const removeRecord = async (userId, gameAbb) => {
        // initialize variables
        const id = correctedId === null ? levelId : correctedId;

        console.log(userId);
        try {
            const { error } = await supabase
                .from(`${gameAbb}_${id}`)
                .delete()
                .match({ user_id: userId });

            if (error) {
                throw (error);
            }

            updateMedalTable(gameAbb);
        } catch (error) {
            alert(error.message);
        }
    }

    // helper function that perform the query to update the totalizer table
    const totalizerUpdateQuery = async (tableName, total, diff, userId) => {
        try {
            const { error } = await supabase
                .from(tableName)
                .update({
                    user_id: userId,
                    total: total + diff
                }, {
                    returning: "minimal", // Don't return the value after inserting
                })
                .eq("user_id", userId);

            if (error) {
                throw error;
            }
        } catch (error) {
            // error code 23503 occurs when a user has authenticated themselves, but not created
            // a profile
            if (error.code === "23503") {
                console.log("Please create a profile before submitting!");
            } else {
                console.log(error);
                alert(error.message);
            }
        }
    }

    // function that will update the totalizer table based on the user's submission
    const updateTotalizer = async (userId, gameAbb, currRecord, isSubmit) => {
        // initalize variables for the 'all' total table
        const tableNameAll = `${gameAbb}_${mode.toLowerCase()}_total_all`;
        const userTotalAll = allTotals[userId];
        const oldRecordAll = Object.keys(currRecord).length === 0 ? 0 : currRecord.record;
        const newRecordAll = isSubmit ? formValues.record : 0;
        const differenceAll = mode === "Score" ? newRecordAll - oldRecordAll : oldRecordAll - newRecordAll;

        //initalize varialbes for the normal total table
        const tableName = `${gameAbb}_${mode.toLowerCase()}_total`;
        const userTotal = totals[userId];

        // 3 cases of oldRecord: 
        // CASE 1: new submission: if currRecord is an empty object, this implies the user never submit to this chart before
        // thus, set oldRecord to 0
        // CASE 2: user has a current submission, and it was live. if this is the case, this means that the current record
        // was accounted for in the totalizer, so set oldRecord equal to the record key
        // CASE 3: user has a current submission, but it was NOT live. if this is the case, this means that the current record
        // was NOT accounted for in the totalizer, so set oldRecord equal to 0.
        let oldRecord;
        if (Object.keys(currRecord).length === 0) {
            oldRecord = 0;
        } else {
            if (currRecord.isLive) {
                oldRecord = currRecord.record;
            } else {
                oldRecord = 0;
            }
        }

        // 3 case of newRecord:
        // CASE 1: isSubmit flag is true, and the record is live. this is a standard entry, so simply set newRecord equal to the record
        // key of the formValues object
        // CASE 2: isSubmit flag is true, but the record is non-live. because this is a non-live submission, this means it will not
        // count toward this totalizer, so set newRecord equal to 0
        // CASE 3: isSubmit flag is false. this implies a deletion, so set newRecord equal to 0, since there is no new record.
        let newRecord;
        if (isSubmit) {
            if (formValues.isLive) {
                newRecord = formValues.record;
            } else {
                newRecord = 0;
            }
        } else {
            newRecord = 0;
        }
        const difference = mode === "Score" ? newRecord - oldRecord : oldRecord - newRecord;

        // now, make the updates in the backend
        totalizerUpdateQuery(tableNameAll, userTotalAll, differenceAll, userId);
        totalizerUpdateQuery(tableName, userTotal, difference, userId);
    }

    // helper function that will generate an object based on the position
    // of a submission on the levelboard. NOTE: isNew will determine
    // whether to set newMedal to medalType or oldMedal to medalType
    const generateObj = (medalType, medals, isNew) => {
        return {
            user_id: medals.user_id,
            oldMedal: isNew ? null : medalType,
            newMedal: isNew ? medalType : null,
            platinum: medals.platinum,
            gold: medals.gold,
            silver: medals.silver,
            bronze: medals.bronze
        }
    }

    // function that will update the medal table based on the user's submission [NOTE: this function will only be run
    // for live submissions]
    const updateMedalTable = async (gameAbb) => {
        // first, requery the level now that a new record has been submitted
        const updatedRecordsFull = await queryRecordsAndClean();
        let updatedRecords = [];

        // now, clean the data
        for (let i = 0; i < updatedRecordsFull.length; i++) {
            // first, delete the monkey property, as it is not useful
            delete updatedRecordsFull[i].monkey;

            // now, check if the record is live. if so, push to the updatedRecords array
            const record = updatedRecordsFull[i];
            if (record.live) {
                updatedRecords.push(structuredClone(record));
            }
        }

        // add the position column to the updated records
        addPosCol(updatedRecords);

        // now, we need to generate an array of objects. the objects will store information about
        // the top 4 of the levelboard BEFORE a new submission has been added (records).
        // each object will have the following properties:
        // userId, oldMedal, newMedal, platinums, golds, silvers, bronzes
        
        // PART 1: Gather userIds of previous top 4, old medals, and plat/gold/silver/bronze
        let userInfo = [];
        let i = 0;
        while (i < records.length && records[i]["Position"] <= 4) {
            // local variables
            const record = records[i];
            const pos = record["Position"];
            const medals = medalTable.find(item => item.user_id === record.user_id);

            // Special case: i = 0. This is the only possible position where a platinum can occur,
            // we need to check for that.
            if (i === 0) {
                if (records.length > 1 && records[i+1]["Position"] === 1) {
                    userInfo.push(generateObj("gold", medals, false));
                } else {
                    userInfo.push(generateObj("platinum", medals, false));
                }
            } 

            // General case: simply translate position to medal
            else {
                if (pos === 1) {
                    userInfo.push(generateObj("gold", medals, false));
                }
                else if (pos === 2) {
                    userInfo.push(generateObj("silver", medals, false));
                }
                else if (pos === 3) {
                    userInfo.push(generateObj("bronze", medals, false));
                }
                else {
                    userInfo.push(generateObj(null, medals, false));
                }
             }
            i++;
        }

        i = 0;
        // PART 2: Gather userIds of new top 3, and new medals. NOTE: if the user was
        // not previously in the top 4, we will need to create a new object for them,
        // and push them into the userInfo array. we must check this at every level
        while (i < updatedRecords.length && updatedRecords[i]["Position"] <= 3) {
            // local variables
            const record = updatedRecords[i];
            const pos = record["Position"];
            const info = userInfo.find(item => item.user_id === record.user_id);
            const medals = medalTable.find(item => item.user_id === record.user_id);

            // Special case: i = 0. This is the only possible position where a platinum can occur,
            // we need to check for that.
            if (i === 0) {
                if (updatedRecords.length > 1 && updatedRecords[i+1]["Position"] === 1) {
                    typeof info === "undefined" ? userInfo.push(generateObj("gold", medals, true)) : info.newMedal = "gold";
                } else {
                    typeof info === "undefined" ? userInfo.push(generateObj("platinum", medals, true)) : info.newMedal = "platinum";
                }

            // General case: translate new position into new medal.
            } else {
                if (pos === 1) {
                    typeof info === "undefined" ? userInfo.push(generateObj("gold", medals, true)) : info.newMedal = "gold";
                }
                else if (pos === 2) {
                    typeof info === "undefined" ? userInfo.push(generateObj("silver", medals, true)) : info.newMedal = "silver";
                }
                else {
                    typeof info === "undefined" ? userInfo.push(generateObj("bronze", medals, true)) : info.newMedal = "bronze";
                }
            }
            i++;
        }

        // Now that we have this information in userInfo, we need to drop any
        // entries where the oldMedal and newMedal are the same, since these entries
        // do not require an update
        const tempArr = [];
        userInfo.forEach(info => {
            if (info.oldMedal !== info.newMedal) {
                tempArr.push(info);
            }
        });
        userInfo = tempArr;

        // This will be the list of users that we need to update. Finally,
        // with that data we have, we can calculate the new medal values for
        // each player.
        for (let i = 0; i < userInfo.length; i++) {
            const user = userInfo[i];
            const oldMedal = user.oldMedal;
            const newMedal = user.newMedal;
            if (user.oldMedal) {
                user[oldMedal] = user[oldMedal]-1;
            }
            if (user.newMedal) {
                user[newMedal] = user[newMedal]+1;
            }
        }

        console.log("userInfo");
        console.log(userInfo);

        // Finally, with this list, we can update the medal table database.
        for (let info of userInfo) {
            try {
                const { error } = await supabase
                    .from(`${gameAbb}_${mode.toLowerCase()}_medal_table`)
                    .upsert({
                        user_id: info.user_id,
                        platinum: info.platinum,
                        gold: info.gold,
                        silver: info.silver,
                        bronze: info.bronze
                    }, {
                        returning: "minimal", // Don't return the value after inserting
                    }, { 
                        onConflict: "user_id"
                    });

                if (error) {
                    throw error;
                }
            } catch (error) {
                console.log(error);
                alert(error.message);
            }
        }

        window.location.reload(); 
    }

    // helper function used by the validate function used to count number of
    // digits past the decimal point
    const decimalCount = (num) => {
        const numStr = String(num);
        if (numStr.includes('.')) {
           return numStr.split('.')[1].length;
        };
        
        // if number does not contain a decimal point, return 0
        return 0;
     }

     // helper function used by the validate function to check if the number contains
     // the letter 'e'. this is to prevent submissions such as: 54.e4.
     const containsE = (num) => {
        const numStr = String(num);
        if (numStr.includes('e')) {
            return true;
        }
        return false;
     }

    // helper function that simply returns the game's abbreviation (used in front-end)
    const getGame = (withMisc) => {
        return withMisc ? abb : miscCheckAndUpdate(abb, "normalize");
    }

    // helper function that simply returns the mode. takes a boolean parameter to decide whether
    // or not to capitalize
    const getMode = (lower) => {
        // if lower is true, return the mode in lowercase. otherwise, simply return mode.
        return lower ? pathArr[3] : mode;
    }

    // function that will verfiy whether or not an id is valid based off the specialIds and modes arrays
    const isValid = (id, specialIds, modes) => {
        if (specialIds.includes(id)) {
            let index = specialIds.indexOf(id);
            if (modes[index] === mode) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    // MAIN FUNCTIONS

    // function that runs when the page is loaded
    const init = async () => {
        const cont = await checkPath();
        if (cont) {
            getModesAndLevels();
            getRecords();
            getSpecialIds();
            getMonkeys();
            checkForMod();
        }
    }

    // function that checks whether or not the path is valid
    const checkPath = async () => {
        // initialize approve variables
        let approvedGame = false;
        let approvedMode = false;

        // now, query the list of games. if the current url matches any of these
        // it is an approved path
        try {
            let {data: games, error, status} = await supabase
                .from("games")
                .select("abb, num_levels, num_levels_misc, time, time_misc");

            if (error && status !== 406) {
                throw error;
            }

            // initialize variables used to check if game is valid
            const correctedAbb = miscCheckAndUpdate(abb, "normalize");
            const n = correctedAbb !== abb ? "num_levels_misc" : "num_levels";

            // now, loop through each game. if the game in the url matches one of these, we need to also check if the id
            // is less than or equal to the max number possible for that particular game.
            games.forEach(game => {
                const gameAbb = game.abb;
                const numLevels = game[n];
                if (correctedAbb === gameAbb && levelId <= numLevels) {
                    approvedGame = true;
                    correctedId = mode === "Time" ? levelId + numLevels : null;

                    // if gameAbb and abb are the same, this implies that this is a non-misc chart
                    gameAbb === abb ? setTimeDefaultVal(game.time) : setTimeDefaultVal(game.time_misc);
                    console.log(gameAbb);
                    console.log(numLevels);
                    setLevelLength(numLevels);
                }
            });

            // now, check to make sure the mode is either time or score
            if (mode === "Time" || mode === "Score") {
                approvedMode = true;
            }

            // if not approved, navigate back to home. otherwise, proceed.
            if (!approvedGame || !approvedMode) {
                navigate("/");
                return false;
            }

            return true;

        } catch(error) {
            alert(error.message);
        }
    }

    //  function used to query all of the records for levelboard
    const getRecords = async () => {
        // declare variables
        const user = supabase.auth.user();
        const userId = user ? user.id : null;
        let recordsList = await queryRecordsAndClean();
        let liveRecordsList = [];

        // if the current user has a submission, set the form values equal to the submission
        // also, delete the recordsList[i].monkey from each record
        for (let i = 0; i < recordsList.length; i++) {
            const record = recordsList[i];

            // if the current user has a submission, set the form values equal to this submission
            // update states as well
            if (userId && record["user_id"] === userId) {
                setFormValues({
                    ...formValues,
                    record: record[`${mode}`], 
                    monkeyId: record.monkey.id, 
                    isLive: record["live"],
                    proof: record["Proof"], 
                    comment: record["Comment"],
                });
                setCurrentRecordData({ record: record[`${mode}`], isLive: record.live });
                setHasUserSubmitted(true);
            }

            // delete the records[i].monkey from each record
            delete recordsList[i].monkey;

            // finally, if the live flag is set to true for a record, this means it is a live record
            // thus, push it to the liveRecordsList
            if (record.live) {
                liveRecordsList.push(structuredClone(recordsList[i]));
            }
        }

        // now, add the position column to both lists
        recordsList = addPosCol(recordsList);
        liveRecordsList = addPosCol(liveRecordsList);

        // finally, update react states for both the records and all records states
        console.log("All Records: ");
        console.log(recordsList);
        console.log("Live-Only Records: ");
        console.log(liveRecordsList);
        setRecords(liveRecordsList);
        setAllRecords(recordsList);
    }

    // function used to establish the modes, as well as creating the levelList
    const getModesAndLevels = async () => {
        const modes = await queryModes();
        for (let mode of modes ) {
            addLevels(mode);
        };
    }

    // function used to get the list of special ids from the database
    const getSpecialIds = async () => {
        const gameAbb = miscCheckAndUpdate(abb, "underline");

        try {
            let { data: ids, error, status } = await supabase
                .from(`${gameAbb}_special`)     
                .select("*")
                .order("special_id");
                
            if (error && status !== 406) {
                throw error;
            }

            console.log("Special Ids: ");
            console.log(ids);
            setSpecialIdList(ids);
        } catch (error) {
            alert(error.message);
        }
    }

    // function used to get the list of monkeys from the database
    const getMonkeys = async () => {
        try {
            let { data: monkeyObj, error, status } = await supabase
                .from("monkey")
                .select("*");

            if (error && status !== 406) {
                throw error;
            }

            console.log("Monkeys: ");
            console.log(monkeyObj);
            setMonkeyList(monkeyObj);
        } catch (error) {
            alert(error.message);
        }
    }

    // function used to get the user's total from the database
    const getTotalAndMedals = async () => {
        // declare variables
        const user = supabase.auth.user();
        const userId = user ? user.id : null;
        const prefix = `${miscCheckAndUpdate(abb, "underline")}_${mode.toLowerCase()}`;
        const defaultVal = 0;

        // these queries are only necessary to run if their is a user logged in, since this information
        // is used in the submission process, and only users are able to submit
        if (user) {
            // first, query the medal table for the respective game and mode
            try {
                let { data: table, error, status } = await supabase
                    .from(`${prefix}_medal_table`)
                    .select("*");
    
                if (error && status !== 406) {
                    throw error;
                }
    
                // if the user does not have a row, we need to do an extra query to add them to the medal table
                const userRow = table.find(item => item.user_id === userId);
                console.log(`Medal Tabel:`);
                if (typeof userRow === "undefined") {
                    try {
                        const { error } = await supabase
                            .from(`${prefix}_medal_table`)
                            .insert({
                                user_id: userId,
                                platinum: defaultVal,
                                gold: defaultVal,
                                silver: defaultVal,
                                bronze: defaultVal
                            });
    
                        if (error) {
                            throw error;
                        }
                        
                        // user must be manually added to the table (this was from the first query to the medal table)
                        table.push({
                            user_id: userId,
                            platinum: defaultVal,
                            gold: defaultVal,
                            silver: defaultVal,
                            bronze: defaultVal
                        });
    
                    } catch (error) {
                        // Error code 23503 occurs when the user has signed up to the website, but has not yet created a profile
                        if (error.code === '23503') {
                            console.log("Failed to create new entry into table because user has not created their profile.");
                        } else {
                            alert(error.message);
                        }
                    }
                }

                console.log(table);
                setMedalTable(table);
                
            } catch (error) {
                alert(error.message);
            }

            // then, query both totals tables for the respective game and mode to query the users' totals for both
            // live-only and live + non-live submissions
            const totalDefault = mode === "Time" ? timeDefaultVal : 0;
            console.log("TIME DEFAULT VAL:");
            console.log(totalDefault);
            queryTotals(false, prefix, userId, totalDefault);
            queryTotals(true, prefix, userId, totalDefault);

        }
    }

    // function that will query the table of mods, and check if current user is a mod
    const checkForMod = async () => {
        // initalize variables
        const user = supabase.auth.user();
        const userId = user ? user.id : null;

        // this query is only necessary if a user is signed in, since only authenticated users
        // could possibly be moderators
        if (user) {
            try {
                const { data: mods, error, status } = await supabase
                    .from("moderators")
                    .select("user_id");
    
                if (error && status !== 406) {
                    throw error;
                }
                
                console.log("Mods: ");
                console.log(mods);
    
                // now, loop through the list of moderators. if the current user has a matching id,
                // this means they are a moderator, so update the isMod state
                for (let mod of mods) {
                    if (mod.user_id === userId) {
                        setIsMod(true);
                    }
                }
    
            } catch (error) {
                alert(error.message);
            }
        }
    }

    // function that will properly sort the list of levels
    const sortLevels = () => {
        // due to api calls not always completing in order, the order of levels is often not sorted properly
        // HOWEVER, within each mode, the levels are sorted properly. thus, we essentially need to sort the levels
        // by mode

        // for each mode (this is ordered properly), sort through the list of levels, and if the level belongs to
        // the mode, push it into arr, a temporary array
        let arr = [];

        for (const mode of modeList) {
            // fairly complex substring logic, which is needed due to differences in level names between games
            for (const level of levelList) {

                // first, determine whether the level is a story mode level or not
                const isWorld = level.includes("Story Mode") ? true : false;
                let levelMode;

                // define digitIndex, which will return the index of the first digit in the level string
                const digitIndex = level.search(/\d/);

                // if isWorld is true, we have to see if this is a single-digit or double digit world. to do this
                // we can check the character following the first digit.
                if (isWorld) {
                    const testChar = level[digitIndex+1];
                    if (testChar >= "0" && testChar <= "9") {
                        levelMode = `World ${level[digitIndex]}${level[digitIndex+1]}`;
                    } else {
                        levelMode = `World ${level[digitIndex]}`;
                    }

                // otherise, simply slice the string on the whitespace before the first digit; this will give the mode
                } else {
                    levelMode = level.slice(0, level.search(/\d/)-1);
                }

                // finally, if we have determined that the mode of the level (levelMode) is equal to mode, push to back
                // of arr
                if (levelMode === mode) {
                    arr.push(level);
                }
            }
        }

        // finally, update states
        console.log("levelList: ");
        console.log(arr);
        setLevelList(arr);
        setTitle(`${mode}: ${arr[levelId-1]}`);
        setLoading(false);
    }


    // function that will submit form values to database, as well as updating both the medal and score/time totalzier tables
    const submit = async () => {
        setSubmitting(true);

        // initialize variables that will be used in each function call
        const userId = supabase.auth.user().id;
        const gameAbb = miscCheckAndUpdate(abb, "underline");
        const submittedRecord = currentRecordData;

        // call to function to submit record to learderboard. this function will also make the call to update the medal table
        submitRecord(userId, gameAbb);

        // call to function to submit record to recent submissions table
        submitToRecent(userId);

        // call to function to update the totalizer table
        updateTotalizer(userId, gameAbb, submittedRecord, true);
    }

    // function that will delete a user's run based on the id parameter. by default, id will equal the current user's id,
    // but a moderator will also have easy access to this function, where they can delete any run
    const remove = async (id, recordToRemove) => {
        setSubmitting(true);

        // initialize variables that will be used in each function call
        const gameAbb = miscCheckAndUpdate(abb, "underline");
        if (Object.keys(recordToRemove).length === 0) {
            recordToRemove = currentRecordData;
        }

        // call to function to remove record from leaderboard. this function will also make the call to update the medal table
        removeRecord(id, gameAbb);

        // call to function to update the totalizer table
        updateTotalizer(id, gameAbb, recordToRemove, false);
    }

    // function that runs each time a form value is changed. keeps the formValues
    // state updated
    const handleChange = (e) => {
        const { id, value, checked } = e.target;
        id === "isLive" ? setFormValues({ ...formValues, [id]: checked }) : setFormValues({...formValues, [id]: value });
        console.log(formValues);
    }

    // function used to swap to a different level
    const swapLevels = (id) => {
        navigate(`/games/${abb}/${getMode(true)}/${id}`);
        window.location.reload();
    }

    // function that activates when the user submits the form. it first validates
    // the inputs before submitting
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrors(validate(formValues));
        setIsSubmit(true);
    }

    // function that validates the inputs by the user
    const validate = (values) => {
        const errors = {};

        // first, validate the record.
        const record = values.record;
        if (!record) {
            errors.record = `${mode} is required.`;
        }
        else if (record <= 0) {
            errors.record = `${mode} must be a positive value.`;
        }
        else if (record > 2147483647) {
            errors.record = `${mode} cannot exceed 2147483647.`;
        }

        // make sure scores are integers
        if (!Object.hasOwn(errors, 'record') && mode === 'Score') {
            if (!Number.isInteger(+record)) {
                errors.record = "Score must be an integer value.";
            }
        }

        // make sure time has two decimal places
        if (!Object.hasOwn(errors, 'record') && mode === 'Time') {
            if (decimalCount(record) !== 2) {
                errors.record = "Please ensure your submission has two decimal places.";
            }
            else if (containsE(record)) {
                errors.record = "Invalid character detected in submission. Please ensure submission has no letters.";
            }
        }

        // next, validate proof.
        if (!values.proof) {
            errors.proof = "Proof is required.";
        }

        // finally, validate the comment
        if (values.comment.length > 100) {
            errors.comment = "Comment must be 100 characters or less.";
        }

        return errors;
    }

    // function that will update states when delete button is presesd
    const updateStates = () => {
        setPopup(true);
    }

    // function that will increment/decrement the level id depending on the
    // increment parameter
    const setLevelId = (increment) => {
        // if increment is zero, decrement mode. otherwise, increment mode.

        // now, we need to ensure user cannot navigate to an unexisting level (id < 0,
        // id > levelList.length, or id is special). this function will prevent user from doing this

        // first, let us handle the edge cases (first two scenarios listed in the comment above)
        if ((!increment && levelId === 1) || (increment && levelId === levelList.length)) {
            return levelId;
        }

        // next, let us break down the specialIdList array into two separate arrays
        let specialIds = [];
        let modes = [];
        for (let element of specialIdList) {
            specialIds.push(element.special_id);
            modes.push(element.is_score ? "Score" : "Time");
        }
        console.log(modes);
        
        // now, we can position ourselves in the array based on whether we are incrementing or decrementing
        // by default, pos will be null. this will change if a special id is detected
        let pos = null;
        const nextLevelId = specialIds.indexOf(levelId+1);
        if (increment && specialIds.includes(levelId+1)) {
            if (modes[nextLevelId] !== mode) {
                pos = nextLevelId;
            }
        }

        const prevLevelId = specialIds.indexOf(levelId-1);
        if (!increment && specialIds.includes(levelId-1)) {
            if (modes[prevLevelId] !== mode) {
                pos = prevLevelId;
            }
        }

        // if pos is still null at this point, everything is normal. let's handle that.
        if (pos === null && increment) {
            return levelId+1;
        }
        if (pos === null && !increment) {
            return levelId-1;
        }

        // finally, we have the special case where an adjacent special id is detected
        // in the direction of motion. return the first id that is not mapped to the
        // current mode
        if (increment) {
            // find first valid id by incrementing
            let id = levelId+1;
            while (id <= levelList.length && !isValid(id, specialIds, modes)) {
                id++;
            }
            
            // finally, need to check if id is within the valid range. if it has exceeded the length
            // of levelList, this means we are already on the final level of this mode, so return
            // levelId
            if (id <= levelList.length) {
                return id;
            } else {
                return levelId;
            }
        } else {
            // find first valid id by decrementing
            let id = levelId-1;
            while (id > 0 && !isValid(id, specialIds, modes)) {
                id--;
            }

            // finally, need to check if id is within the valid range. if it 0 or less,
            // this means we are on the first level of this mode, so return levelId
            if (id > 0) {
                return id;
            } else {
                return levelId;
            }
        }
    }

      // MonkeySelect component
      const MonkeySelect = () => {
        return (
            <select 
                id="monkeyId"
                value={formValues.monkeyId}
                onChange={handleChange}
            >
                {monkeyList.map((monkey) => (
                    <option key={monkey.id} value={monkey.id}>{monkey.monkey_name}</option>
                ))}
            </select>
        )
      }

    return { loading,
             records,
             allRecords,
             timeDefaultVal,
             showAll,
             title, 
             levelList,
             levelLength,
             isMod,
             formValues, 
             formErrors,
             hasUserSubmitted,
             isSubmit,
             popup,
             submitting,
             setShowAll,
             setPopup,
             init,
             sortLevels,
             submit,
             remove,
             handleChange,
             swapLevels, 
             handleSubmit,
             getGame, 
             getMode, 
             getTotalAndMedals,
             updateStates,
             setLevelId, 
             MonkeySelect
    };
}

export default LevelboardInit;