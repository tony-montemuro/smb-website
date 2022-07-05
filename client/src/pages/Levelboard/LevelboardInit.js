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
    const [monkeyList, setMonkeyList] = useState([]);
    const [formValues, setFormValues] = useState(initialValues);
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSubmit, setIsSubmit] = useState(false);

    // HELPER FUNCTIONS

    // helper function that converts a normal string to one in snake case
    const toSnake = (str) => {
        str = str.toLowerCase();
        str = str.replace(' ', '_');
        return str;
    };

    // helper function used to query all of the records for levelboard
    const getRecords = async () => {
        console.log(correctedId);
        const id = correctedId === null ? levelId : correctedId;
        try {
            let { data: records, error, status } = await supabase
                .from(`${abb}_${id}`)
                .select(`
                    user_id,
                    profiles:user_id ( username, country, avatar_url ),
                    ${mode},
                    monkey:monkey_id ( monkey_name ),
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
            // also, simplify each object
            for (let i = 0; i < records.length; i++) {
                records[i]["Position"] = posCount;
                trueCount++;
                if (i < records.length-1 && records[i+1][mode] !== records[i][mode]) {
                    posCount = trueCount;
                }

                // simplify
                records[i]["Monkey"] = records[i].monkey.monkey_name;
                records[i]["Name"] = records[i].profiles.username;
                records[i]["Avatar_URL"] = records[i].profiles.avatar_url;
                records[i]["Country"] = records[i].profiles.country;
                delete records[i].monkey;
                delete records[i].profiles;
            }

            console.log(records);
            setRecords(records);
            setLoading(false);

        } catch (error) {
            alert(error.message);
        }
    }

    // helper function used to query the modes
    const queryModes = async () => {
        let modeList = [];
        let gameAbb = abb;
        if (gameAbb === "smb2pal") {
            gameAbb = "smb2";
        }

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
        let gameAbb = abb;
        if (gameAbb === "smb2pal") {
            gameAbb = "smb2";
        }

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
        return abb;
    }

    // helper function that simply returns the mode. takes a boolean parameter to decide whether
    // or not to capitalize
    const getMode = (lower) => {
        // if lower is true, return the mode in lowercase. otherwise, simply return mode.
        return lower ? pathArr[3] : mode;
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
                .select("abb, num_levels");

            if (error && status !== 406) {
                throw error;
            }

            games.forEach(game => {
                const gameAbb = game.abb;
                const numLevels = game.num_levels;
                if (abb === gameAbb) {
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
            console.log(monkeyObj);
        } catch (error) {
            alert(error.message);
        }
    }

    // function that will submit form values to database
    const submitValues = async () => {
        const userId = supabase.auth.user().id;
        const date = new Date();
        console.log(correctedId);
        const id = correctedId === null ? levelId : correctedId;

        try {
            const { error } = await supabase
                .from(`${abb}_${id}`)
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

            window.location.reload();

        } catch (error) {
            if (error.code === "23503") {
                alert("Error! You have not set up your profile yet. Please go to the top right of the page, and set up your profile to begin submissions.");
            } else {
                alert(error.message);
            }
        }
    }

    // function that runs each time a form value is changed. keeps the formValues
    // state updated
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormValues({...formValues, [id]: value});
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

        // now, we need to ensure user cannot navigate to an unexisting level (id < 0
        // or id > levelList.length). this function will prevent user from doing this
        if (!increment && levelId > 1) {
            return levelId-1;
        }
        if (increment && levelId < levelList.length) {
            return levelId+1;
        }
        return levelId;
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
             checkPath, 
             getTitleAndRecords, 
             getMonkeys,
             submitValues,
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