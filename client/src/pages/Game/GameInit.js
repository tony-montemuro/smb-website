import "./game.css";

import { useState } from 'react';
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useNavigate, Link } from 'react-router-dom';

const GameInit = () => {
    
    const navigate = useNavigate();

    // states
    const [levelModes, setLevelModes] = useState({modes: []});
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    
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

    const queryMode = async (mode, obj) => {
        let gameAbb = abb;
        if (gameAbb === "smb2pal") {
            gameAbb = "smb2";
        }

        try {
            let {data, error, status} = await supabase
                .from(`${gameAbb}_${mode}`)
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
    const getLevels = async (modes) => {
        // init variables
        let levelModesObj = {modes: []};

        // begin setting up the levelModeObj
        modes.forEach(mode => {
            levelModesObj["modes"].push(mode);
        });

        // now, query each mode to get the list of levels
        for (let mode of modes) {
            await queryMode(toSnake(mode), levelModesObj);
        }

        setLevelModes(levelModes => ({
            ...levelModes,
            ...levelModesObj
        }));

        setLoading(false);

        console.log(levelModesObj["advanced"]);
    }

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
            // first, check if game is 'smb2like'. if so, query the monkey ball 2 table.
            let smb2Like = await queryNames("smb2_like");
            if (smb2Like.includes(abb)) {
                modes = await queryNames("smb2_modes");
            } else {
                //otherwise, query abb's mode table
                modes = await queryNames(`${abb}_modes`);
            }

            console.log(modes);

            getLevels(modes);
        } catch(error) {
            alert(error.message);
        }
    }

    // component used to render the level, with a time and score link component
    const Level = ({val, id}) => {
        return (
            <tr className="lvl-time-score">
                <td><p>{val}</p></td>
                <td><Link to={{pathname: `score/${id}`}}><button>Score</button></Link></td>
                <td><Link to={{pathname: `time/${id}`}}><button>Time</button></Link></td>
            </tr>
        )
    }

    const getLevelIdByMode = (mode) => {
        // first, make a hard copy of the modes array from the levelModes obj
        const modeArr = [...levelModes["modes"]];

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
            id += levelModes[currMode].length;
            i++;
            currMode = modeArr[i];
        }

        return id;
    }

    // component used to render the mode, as well as it's levels
    const ModeLevel = ({child}) => {
        const snake_mode = toSnake(child);
        const [show, setShow] = useState(false);
        
        let id = getLevelIdByMode(toSnake(child));

        return (
            <tbody className="mode-level">
                <tr onClick={()=>setShow(!show)} className="mode-name">
                    <td><h3>{child}</h3></td>
                    <td className="blank"></td>
                    <td className="blank"></td>
                </tr>
                {levelModes[snake_mode].map((val) => {
                    return show ? <Level val={val.name} id={++id} /> : null
                })}
            </tbody>
        );
    }

    // component used to render the table of modes and levels
    const ModeLevelTable = () => {
        return (
            <>
                {levelModes["modes"].map((val) => {
                    return <ModeLevel child={val} />
                })}
            </>
        );
    }

    return { loading, title, checkPath, getModesLevels, ModeLevel, ModeLevelTable };
}

export default GameInit;