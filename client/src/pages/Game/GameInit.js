import "./game.css";

import { useState } from 'react';
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useNavigate, Link } from 'react-router-dom';

const GameInit = () => {
    
    const navigate = useNavigate();

    // states
    const [levelModes, setLevelModes] = useState({modes: []});
    const [levelModesMisc, setLevelModesMisc] = useState({modes: []});
    const [loading, setLoading] = useState(true);
    const [loadingMisc, setLoadingMisc] = useState(true);
    const [title, setTitle] = useState("");
    const [selectedRadioBtn, setSelectedRadioBtn] = useState("main");
    
    // path variables
    const path = window.location.pathname;
    const abb = path.split("/")[2];

    const checkPath = async () => {
        try {
            let approved = false;

            // now, query the list of games. if the current url matches any of these
            // it is an approved path
            let {data: games, error, status} = await supabase
                .from("games")
                .select("*");

            // if there was an error querying data, throw error
            if (error && status !== 406) {
                throw error;
            }

            // now, iterate through game list, and compare with the current abb variable
            games.forEach(game => {
                const gameAbb = game.abb;
                const gameTitle = game.name;
                if (abb === gameAbb) {
                    approved = true;
                    setTitle(gameTitle);
                }
            });

            // if not approved, navigate back to home. otherwise, proceed.
            if (!approved) {
                navigate("/");
            }

        } catch(error) {
            alert(error.message);
        }
    }
    
    // function that converts a normal string to one in snake case
    const toSnake = (str) => {
        str = str.toLowerCase();
        str = str.replace(' ', '_');
        return str;
    };

    // function that queries a mode to gather all 
    const queryMode = async (mode, obj, isMisc) => {
        let gameAbb = abb;
        if (gameAbb === "smb2pal") {
            gameAbb = "smb2";
        }

        let path = `${gameAbb}_${mode}`;
        if (isMisc) {
            path = `${gameAbb}_misc_${mode}`;
        }

        try {
            let {data, error, status} = await supabase
                .from(path)
                .select("*");

            if (error && status !== 406) {
                throw error;
            }

            obj[mode] = data;
        } catch(error) {
            alert(error.message);
        }
    }

    // function that makes a call to the backend server to get the list of levels
    const getLevels = async (modes, isMisc) => {
        // init variables
        let levelModesObj = {modes: []};
        levelModesObj["modes"] = modes;

        // now, query each mode to get the list of levels
        for (let mode of modes) {
            mode = toSnake(mode);
            await queryMode(mode, levelModesObj, isMisc);
        }

        if (isMisc) {
            setLevelModesMisc(levelModes => ({
                ...levelModes,
                ...levelModesObj
            }));
            setLoadingMisc(false);
        } else {
            setLevelModes(levelModes => ({
                ...levelModes,
                ...levelModesObj
            }));
            setLoading(false);
        }
        
        console.log(levelModesObj);

    }

    // function that queries the names column for table 'tableName'
    const queryNames = async (tableName) => {
        try {
            let {data, error, status} = await supabase
                .from(`${tableName}`)
                .select("name");
            
            if (error && status !== 406) {
                throw error;
            }

            let arr = [];
            data.forEach(element => {
                arr.push(element.name);
            });

            return arr;
        } catch (error) {
            alert(error.message);
        }
    }

    // function that makes a call to the backend server to get the list of modes
    const getModesLevels = async () => {
        let modes = [];

        try {
            //query abb's mode table
            modes = await queryNames(`${abb}_modes`);
            
            // then, we can begin gathering the levels for each mode
            getLevels(modes, false);

            // once this has finished, we must then collect miscellaneous chart information
            modes = await queryNames(`${abb}_misc_modes`);
            
            // finally, we can begin gathering the misc. levels for each mode
            getLevels(modes, true);

        } catch(error) {
            alert(error.message);
        }
    }

    const getLevelIdByMode = (mode, isMisc) => {
        // first, make a hard copy of the modes array from the levelModes obj
        const modeArr = isMisc ? [...levelModesMisc["modes"]] : [...levelModes["modes"]];

        // then, 'snakeify' each element
        for (let i = 0; i < modeArr.length; i++) {
            modeArr[i] = toSnake(modeArr[i]);
        }

        // next, set up variables for loop
        let i = 0;
        let id = 0;
        let currMode = modeArr[0];

        // finally, loop through the lengths of modes until you have reached the
        // current mode. sum these lengths to get the level id
        while (currMode !== mode) {
            id += isMisc ? levelModesMisc[currMode].length : levelModes[currMode].length;
            i++;
            currMode = modeArr[i];
        }

        return id;
    }

    const isRadioSelected = (val) => {
        return selectedRadioBtn === val;
    }

    const handleModeChange = (e) => {
        setSelectedRadioBtn(e.target.value);
        console.log(e.target.value);
    }

    // component used to render the level, with a time and score link component
    const Level = ({val, mode, isMisc, id}) => {
        // first, initalize path variables. this will depend on the isMisc variable.
        let scorePath;
        let timePath;
        if (isMisc) {
            scorePath = `/games/${abb}misc/score/${id}`;
            timePath = `/games/${abb}misc/time/${id}`;
        } else {
            scorePath = `/games/${abb}/score/${id}`;
            timePath = `/games/${abb}/time/${id}`;
        }

        // Level components depend on the mode variable, which can take on 3 different states:
        // true: only the score button should be rendered (if)
        // false: only the time button should be rendered (else if)
        // null: both time and score buttons should be rendered (else)
        if (mode === true) {
            return (
                <tr className="lvl-time-score">
                    <td><p>{val}</p></td>
                    <td className="blank"></td>
                    <td><Link to={{pathname: scorePath}}><button>Score</button></Link></td>
                </tr>
            )
        } else if (mode === false) {
            return (
                <tr className="lvl-time-score">
                    <td><p>{val}</p></td>
                    <td className="blank"></td>
                    <td><Link to={{pathname: timePath}}><button>Time</button></Link></td>
                </tr>
            )
        } else {
            return (
                <tr className="lvl-time-score">
                    <td><p>{val}</p></td>
                    <td><Link to={{pathname: scorePath}}><button>Score</button></Link></td>
                    <td><Link to={{pathname: timePath}}><button>Time</button></Link></td>
                </tr>
            )
        }
    }

    // component used to render the mode, as well as it's levels
    const ModeLevel = ({child, isMisc}) => {
        const snake_mode = toSnake(child);
        const [show, setShow] = useState(false);
        
        let id = getLevelIdByMode(toSnake(child), isMisc);

        return (
            <tbody className="mode-level">
                <tr onClick={()=>setShow(!show)} className="mode-name">
                    <td><h3>{child}</h3></td>
                    <td className="blank"></td>
                    <td className="blank"></td>
                </tr>
                {isMisc ? 
                    levelModesMisc[snake_mode].map((val) => {
                        return show ? <Level key={val.name} val={val.name} mode={val.mode} isMisc={true} id={++id} /> : null
                    })
                    :
                    levelModes[snake_mode].map((val) => {
                        return show ? <Level key={val.name} val={val.name} mode={val.mode} isMisc={false} id={++id} /> : null
                    })
                }
            </tbody>
        );
    }

    // component used to render the table of modes and levels
    const ModeLevelTable = () => {
        return (
            <>
                {selectedRadioBtn === "main" ? 
                    levelModes["modes"].map((val) => {
                        return <ModeLevel key={val} child={val} isMisc={false} />
                    })
                    :
                    levelModesMisc["modes"].map((val) => {
                        return <ModeLevel key={val} child={val} isMisc={true} />
                    })
                }
            </>
        );
    }

    // component used to render links to the totalizer boards
    const TotalizerBoards = () => {
        const gameAbb = selectedRadioBtn === "main" ? abb : abb + "misc";

        return (
            <div>
                <Link to={{pathname: `/games/${gameAbb}/totalizer`}}>
                    {selectedRadioBtn === "main" ? 
                        <p>Score & Time Totalizers</p>
                        :    
                        <p>Misc. Score & Time Totalizers</p>
                    }
                </Link>
            </div>
        );
    }

    return { loading,
            loadingMisc,
            title, 
            checkPath, 
            getModesLevels, 
            isRadioSelected, 
            handleModeChange, 
            ModeLevelTable,
            TotalizerBoards
        };
}

export default GameInit;