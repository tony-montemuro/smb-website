import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

// global variables
let correctedId = null;

const LevelboardInit = () => {
    // variable
    const initialValues = { record: "", monkeyId: 1, proof: "", comment: ""};
    
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
    const [title, setTitle] = useState("");
    const [levelList, setLevelList] = useState([]);
    const [specialIdList, setSpecialIdList] = useState([]);
    const [monkeyList, setMonkeyList] = useState([]);
    const [formValues, setFormValues] = useState(initialValues);
    const [formErrors, setFormErrors] = useState({});
    const [currentRecord, setCurrentRecord] = useState(null);
    const [total, setTotal] = useState(null);
    const [medalTable, setMedalTable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmit, setIsSubmit] = useState(false);
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

    // helper function used to query all of the records for levelboard
    const getRecords = async () => {
        const id = correctedId === null ? levelId : correctedId;
        const gameAbb = miscCheckAndUpdate(abb, "underline");
        let userId = null;
        if (supabase.auth.user()) {
            userId = supabase.auth.user().id;
        }

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

            // variables used to determine position of each submission
            let trueCount = 1;
            let posCount = trueCount;

            // now, iterate through each record, and calculate the position.
            // simplify each object. also, if the current user has a submission,
            // set the form values equal to the submission
            for (let i = 0; i < records.length; i++) {
                const record = records[i];
                record["Position"] = posCount;
                trueCount++;
                if (i < records.length-1 && records[i+1][mode] !== record[mode]) {
                    posCount = trueCount;
                }

                // simplify
                record["Monkey"] = record.monkey.monkey_name;
                record["Name"] = record.profiles.username;
                record["Avatar_URL"] = record.profiles.avatar_url;
                record["Country"] = record.profiles.country;
                delete records[i].profiles;

                if (userId && record["user_id"] === userId) {
                    setFormValues({
                        ...formValues,
                        record: record[`${mode}`], 
                        monkeyId: record.monkey.id, 
                        proof: record["Proof"], 
                        comment: record["Comment"]
                    });
                    setCurrentRecord(record[`${mode}`]);
                }

                delete records[i].monkey;
            }

            console.log(records);
            setRecords(records);
            setLoading(false);

        } catch (error) {
            if (error.code === "PGRST200") {
                navigate("/");
            } else {
                alert(error.message);
            }
        }
    }

    // helper function used to query the modes
    const queryModes = async () => {
        let modeList = [];
        const gameAbb = miscCheckAndUpdate(abb, "underline");

        try {
            let {data: modes, error, status} = await supabase
                .from(`${gameAbb}_modes`)
                .select("name");

            if (error && status !== 406) {
                throw error;
            }

            for (let mode of modes) {
                modeList.push(mode.name);
            }
            return modeList;

        } catch(error) {
            alert(error.message);
        }
    }

    // helper function that adds levels to levelList parameter from the mode parameter
    const addLevels = async (mode, levelList) => {
        const gameAbb = miscCheckAndUpdate(abb, "underline");

        try {
            let {data: levels, error, status} = await supabase
                .from(`${gameAbb}_${toSnake(mode)}`)
                .select("name");

            if (error && status !== 406) {
                throw error;
            }

            levels.forEach((level) => {
                levelList.push(level.name);
            });

        } catch(error) {
            throw (error.message);
        }
    }

    // function that will submit user's record to the levelboard
    const submitRecord = async (userId, gameAbb) => {
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
                    Comment: formValues.comment
                }, {
                    returning: "minimal", // Don't return the value after inserting
                }, { 
                    onConflict: "user_id"
                });

            if (error) {
                throw error;
            }

            if (records.length > 0) {
                console.log("HIT WRONG PATH");
                updateMedalTable(userId, gameAbb);
            } else {
                // special case: the chart is empty. if this is the case, award player with a platinum medal
                try {
                    const userMedals = medalTable.find(item => item.user_id === userId);
                    console.log(userMedals);
                    console.log("^ USER MEDALS");
                    const { error } = await supabase
                        .from(`${gameAbb}_${mode.toLowerCase()}_medal_table`)
                        .upsert({
                            user_id: userId,
                            platinum: userMedals.platinum+1,
                            gold: userMedals.gold,
                            silver: userMedals.silver,
                            bronze: userMedals.bronze
                        }, {
                            returning: "minimal", // Don't return the value after inserting
                        })
                        .eq("user_id", userId);

                    if (error) {
                        throw(error);
                    }

                    console.log("Medal table updated");
                } catch (error) {
                    alert(error.message);
                } finally {
                    window.location.reload();
                }
            }

        } catch (error) {
            if (error.code === "23503") {
                alert("Error! You have not set up your profile yet. Please go to the top right of the page, and set up your profile to begin submitting.");
            } else {
                console.log(error);
                alert(error.message);
            }
        }
    }

    // function that will update the totalizer table based on the user's submission
    const updateTotalizer = async (userId, gameAbb) => {
        const oldRecord = currentRecord === null ? 0 : currentRecord;
        const newRecord = formValues.record;
        const difference = newRecord - oldRecord;

        try {
            const { error } = await supabase
                .from(`${gameAbb}_${mode.toLowerCase()}_total`)
                .upsert({
                    user_id: userId,
                    total: total + difference
                }, {
                    returning: "minimal", // Don't return the value after inserting
                }, { 
                    onConflict: "user_id"
                });

            if (error) {
                throw error;
            }
        } catch (error) {
            if (error.code === "23503") {
                console.log("Please create a profile before submitting!");
            } else {
                alert(error.message);
            }
        }
    }

    // function that will update the medal table based on the user's submission
    const updateMedalTable = async (user_id, gameAbb) => {
        const newRecord = formValues.record;

        // now, traverse the object, and figure out where the new record should go
        let i = 0;
        while (newRecord < records[i][mode]) {
            i++;
        }

        // once we have figured out where, there are two general cases:
        // ties and unties. the medal table must be changed differently depending on if the user
        // tied or untied a 1st, 2nd, or 3rd place score/time

        // TIES
        if (newRecord === records[i][mode]) {
            // now, there are three positions we need to worry about: 1st, 2nd/3rd, and 4th+
            if (records[i]["Position"] === 1) {
                // when a user ties a first place score/time, we must check whether or not 1st place was previously tied
                // or not
                if (i < records.length-1 && records[i][mode] === records[i+1][mode]) {
                    alert(`${user_id} recieves a gold medal.`);
                } else {
                    alert(`${user_id} recieves a gold medal. ${records[i].user_id} loses a platinum medal, but gains a gold medal.`);
                }
            }
            else if (records[i]["Position"] >= 2 && records[i]["Position"] <= 3) {
                alert(`${user_id} recieves a silver/bronze medal.`);
            }
            if (records[i]["Position"] > 3) {
                alert(`${user_id} recieves no medals for this submission.`);
            }
        } 
        // UNTIES
        else {

        }
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
    const getGame = () => {
        return miscCheckAndUpdate(abb, "normalize");
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

    // function that checks whether or not the path is valid
    const checkPath = async () => {
        let approvedGame = false;
        let approvedMode = false;

        // now, query the list of games. if the current url matches any of these
        // it is an approved path
        try {
            let {data: games, error, status} = await supabase
                .from("games")
                .select("abb, num_levels, num_levels_misc");

            if (error && status !== 406) {
                throw error;
            }

            const correctedAbb = miscCheckAndUpdate(abb, "normalize");
            let n = "num_levels";
            if (correctedAbb !== abb) {
                n = "num_levels_misc";
            }

            games.forEach(game => {
                const gameAbb = game.abb;
                const numLevels = game[n];
                if (correctedAbb === gameAbb) {
                    approvedGame = true;
                    if (mode === "Time") {
                        correctedId = levelId + numLevels;
                    } else {
                        correctedId = null;
                    }
                }
            });

            // now, check to make sure the mode is either time or score
            if (mode === "Time" || mode === "Score") {
                approvedMode = true;
            }

            // if not approved, navigate back to home. otherwise, proceed.
            if (!approvedGame || !approvedMode) {
                navigate("/");
            }

        } catch(error) {
            alert(error.message);
        }
    }

    // function that generates the list of levels from the set of modes defined in the
    // modes parameter
    const generateLevelList = async (modes) => {
        let levelList = [];
        for (let mode of modes ) {
            await addLevels(mode, levelList);
        };
        setTitle(`${mode}: ${levelList[levelId-1]}`);
        setLevelList(levelList);
        getRecords();
        
    }

    // function used to establish the modes 
    const getTitleAndRecords = async () => {
        const modes = await queryModes();
        generateLevelList(modes);
    }

    // function used to get the list of special ids from the database
    const getSpecialIds = async () => {
        const gameAbb = miscCheckAndUpdate(abb, "underline");

        try {
            let { data: ids, error, status } = await supabase
                .from(`${gameAbb}_special`)     
                .select("*");
                
            if (error && status !== 406) {
                throw error;
            }

            console.log(ids);
            setSpecialIdList(ids);
        } catch (error) {

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

            setMonkeyList(monkeyObj);
        } catch (error) {
            alert(error.message);
        }
    }

    // function used to get the user's total from the database
    const getTotalAndMedals = async () => {
        const user = supabase.auth.user();
        const userId = user.id;
        const prefix = `${miscCheckAndUpdate(abb, "underline")}_${mode.toLowerCase()}`;
        const defaultVal = 0;

         // first, query the medal table for the respective game and mode
         try {
            let { data, error, status } = await supabase
                .from(`${prefix}_medal_table`)
                .select("*");

            if (error && status !== 406) {
                throw error;
            }

            const userRow = data.find(item => item.user_id === userId);
            console.log(`Medal Tabel:`);
            if (typeof userRow === "undefined") {
                try {
                    const { data, error } = await supabase
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

                    console.log(data);
                    setMedalTable(data);

                } catch (error) {
                    if (error.code === '23503') {
                        console.log("Failed to create new entry into table because user has not created their profile.");
                    } else {
                        alert(error.message);
                    }
                }
            } else {
                console.log(data);
                setMedalTable(data);
            }
            
        } catch (error) {
            alert(error.message);
        }

        // then, query the totals table for the respective game and mode to query the user's total
        if (user) {
            const userId = user.id;

            try {
                let { data, error, status } = await supabase
                    .from(`${prefix}_total`)
                    .select("total")
                    .eq("user_id", userId)
                    .single();

                if (error && status !== 406) {
                    throw error;
                }

                // special case that occurs if user has never submitted to a category. create a new
                // entry in the table for them. do this for the medal table as well.
                if (status === 406 && data === null) {
                    try {
                        const { error } = await supabase
                            .from(`${prefix}_total`)
                            .insert({ 
                                user_id: userId,
                                total: defaultVal
                            });

                        if (error) {
                            throw error;
                        }

                        setTotal(defaultVal);

                    } catch (error) {
                        if (error.code === '23503') {
                            console.log("Failed to create new entry into table because user has not created their profile.");
                        } else {
                            alert(error.message);
                        }
                    }
                    
                } else {
                    setTotal(data.total);
                }
            } catch (error) {
                alert(error.message);
            }
        }
    }


    // function that will submit form values to database, as well as updating both the medal and score/time totalzier tables
    const submit = async () => {
        setSubmitting(true);

        // initialize variables that will be used in each function call
        const userId = supabase.auth.user().id;
        const gameAbb = miscCheckAndUpdate(abb, "underline");

        // call to function to submit record to learderboard. this function will also make the call to update the medal table
        submitRecord(userId, gameAbb);

        // call to function to update the totalizer table
        updateTotalizer(userId, gameAbb);
    }

    // function that runs each time a form value is changed. keeps the formValues
    // state updated
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormValues({...formValues, [id]: value});
        console.log(formValues);
        console.log(records);
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
        if (increment && specialIds.includes(levelId+1)) {
            const index = specialIds.indexOf(levelId+1);
            if (modes[index] !== mode) {
                pos = specialIds.indexOf(levelId+1);
            }
        }
        if (!increment && specialIds.includes(levelId-1)) {
            const index = specialIds.indexOf(levelId-1);
            console.log(modes[index]);
            if (modes[index] !== mode) {
                pos = specialIds.indexOf(levelId-1);
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
             title, 
             formValues,
             formErrors,
             isSubmit,
             submitting,
             checkPath, 
             getTitleAndRecords, 
             getSpecialIds,
             getMonkeys,
             getTotalAndMedals,
             submit,
             handleChange,
             swapLevels, 
             handleSubmit,
             getGame, 
             getMode, 
             setLevelId,
             MonkeySelect
    };
}

export default LevelboardInit;