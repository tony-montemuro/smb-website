import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

const LevelboardInit = () => {
    // variables
    const initialValues = { record: "", monkeyId: 0, proof: "", comment: ""};
    
    // function used to capitalize an input string called str
    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // navigate used for redirecting
    const navigate = useNavigate();

    // states
    const [records, setRecords] = useState([]);
    const [title, setTitle] = useState("");
    const [levelList, setLevelList] = useState([]);
    const [monkeyList, setMonkeyList] = useState([]);
    const [formValues, setFormValues] = useState(initialValues);
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSubmit, setIsSubmit] = useState(false);
    
    // path variables
    const path = window.location.pathname;
    const pathArr = path.split("/");
    const abb = pathArr[2];
    const mode = capitalize(pathArr[3]);
    let levelId = parseInt(pathArr[4]);

    // offset variables
    const smb1TotalLevels = 9;
    const smb2TotalLevels = 11;

    // function that converts a normal string to one in snake case
    const toSnake = (str) => {
        str = str.toLowerCase();
        str = str.replace(' ', '_');
        return str;
    };

    const checkPath = async () => {
        let approvedGame = false;
        let approvedMode = false;

        // now, query the list of games. if the current url matches any of these
        // it is an approved path
        try {
            let {data: games, error, status} = await supabase
                .from("games")
                .select("abb");

            if (error && status !== 406) {
                throw error;
            }

            games.forEach(game => {
                const gameAbb = game.abb;
                if (abb === gameAbb) {
                    approvedGame = true;
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

    const getRecords = async () => {
        if (mode === "Time") {
            if (abb === "smb1") {
                levelId += smb1TotalLevels;
            }
            if (abb === "smb2" || abb === "smb2pal") {
                levelId += smb2TotalLevels
            }
        }

        try {
            // let { data: records, error, status } = await supabase
            //     .from(`${abb}_${levelId}`)
            //     .select("*");

            // if (error && status !== 406) {
            //     throw error;
            // }

            let { data: records, error, status } = await supabase
                .from(`${abb}_${levelId}`)
                .select(`
                    profiles:user_id ( username ),
                    ${mode},
                    monkey:monkey_id ( monkey_name ),
                    Day,
                    Month,
                    Year,
                    Proof,
                    Comment
                `);

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
                records[i]["Monkey"] = records[i].monkey.monkey_name;
                records[i]["Name"] = records[i].profiles.username;
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

    const generateLevelList = async (modes) => {
        let levelList = [];
        for (let mode of modes ) {
            await addLevels(mode, levelList);
        };
        setTitle(`${mode}: ${levelList[levelId-1]}`);
        setLevelList(levelList);
        getRecords();
        
    }

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

    const getTitleAndRecords = async () => {
        const modes = await queryModes();
        generateLevelList(modes);
    }

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

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormValues({...formValues, [id]: value});
        console.log(formValues);
    }

    const swapLevels = (id) => {
        navigate(`/games/${abb}/${getMode(true)}/${id}`);
        window.location.reload();
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrors(validate(formValues));
        setIsSubmit(true);
    }

    const validate = (values) => {
        const errors = {};

        // first, validate the record. extra validation for time submissions as well.
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

        // make sure times are NOT integeres
        if (!Object.hasOwn(errors, 'record') && mode === 'Time') {
            if (Number.isInteger(+record)) {
                errors.record = "Invalid time format. Example of correct format: 45.51.";
            } 
        }

        if (!values.proof) {
            errors.proof = "Proof is required.";
        }

        if (values.comment.length > 100) {
            errors.comment = "Comment must be 100 characters or less.";
        }

        return errors;
    }

    const getGame = () => {
        return abb;
    }

    const getMode = (lower) => {
        // if lower is true, return the mode in lowercase. otherwise, simply return mode.
        return lower ? pathArr[3] : mode;
    }

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

    const Board = () => {
        return (
            <div className="levelboard-container">
                <table>
                <tbody>
                    <tr>
                        <th>Position</th>
                        <th>Name</th>
                        <th>{getMode()}</th>
                        <th>Date</th>
                        <th>Monkey</th>
                        <th>Proof</th>
                    </tr>
                    {records.map((val) => {
                        return <tr>
                        <td>{val.Position}</td>
                        <td>{val.Name}</td>
                        <td>{getMode() === "Score" ? val.Score : val.Time}</td>
                        <td>{val.Month}/{val.Day}/{val.Year}</td>
                        <td>{val.Monkey}</td>
                        <td>{val.Proof !== "none" ? <a href={val.Proof} target="_blank" rel="noopener noreferrer">☑️</a> : ''}</td>
                        </tr>  
                    })}
                </tbody>
                </table>
            </div>
        )
      }

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
             title, 
             formValues,
             formErrors,
             isSubmit,
             checkPath, 
             getTitleAndRecords, 
             handleChange,
             getMonkeys,
             swapLevels, 
             handleSubmit,
             getGame, 
             getMode, 
             setLevelId,
             Board,
             MonkeySelect
    };
}

export default LevelboardInit;