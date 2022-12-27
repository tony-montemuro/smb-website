import "./game.css";

import { useState } from 'react';
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useNavigate, Link } from 'react-router-dom';

const GameInit = () => {
    // navigate variable used to navigate to home screen if error is detected
    const navigate = useNavigate();

    // states
    const [levelModes, setLevelModes] = useState({modes: []});
    const [miscLevelModes, setMiscLevelModes] = useState({modes: []});
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [selectedRadioBtn, setSelectedRadioBtn] = useState("main");
    
    // path variables
    const path = window.location.pathname;
    const abb = path.split("/")[2];

    // ===== MODES AND LEVELS QUERY =====

    // function that initializes an object with empty arrays based on
    // the names of the strings, and then fills each array with levels with
    // the corresponding modes. returns object.
    const initLevelModeObj = (modes, levels) => {
        // first, initialize object
        const obj = { modes: modes };
        modes.forEach(mode => {
            obj[mode] = [];
        });

        // now, fill it
        levels.forEach(level => {
            obj[level.mode.name].push({ 
                id: level.name,
                chart_type: level.chart_type
            });
        });
        return obj;
    }

    // function that queries the list of levels to generate our levelModes objects
    const getModesLevels = async () => {
        try {
            // perform query
            let { data: levels, error, status } = await supabase
                .from("level")
                .select(`
                    name, 
                    misc, 
                    mode (name, game (name)),
                    chart_type
                `)
                .eq("game", abb)
                .order("id");

            // check for error
            if ((error && status !== 406) || levels.length === 0) {
                throw error ? { code: 1 } : error
            }

            // first, let's set the gameTitle
            const gameTitle = levels[0].mode.game.name;
            setTitle(gameTitle);

            // next, we need to split the levels based on whether they are misc or not
            const mainLevels = [];
            const miscLevels = [];
            let mainModes = new Set();
            let miscModes = new Set();
            levels.forEach(level => {
                if (level.misc) {
                    miscLevels.push(level);
                    miscModes.add(level.mode.name);
                } else {
                    mainLevels.push(level);
                    mainModes.add(level.mode.name);
                }
            });
            mainModes = [...mainModes];
            miscModes = [...miscModes];

            // next, let's create objects that divide the levels by modes
            const levelModes2 = initLevelModeObj(mainModes, mainLevels);
            const miscLevelModes2 = initLevelModeObj(miscModes, miscLevels);
            console.log(levelModes2);
            console.log(miscLevelModes2);

            // finally, update react states
            setLevelModes(levelModes2);
            setMiscLevelModes(miscLevelModes2);
            setLoading(false); 

        } catch(error) {
            if (error.code === 1) {
                navigate("/");
            } else {
                console.log(error);
                alert(error);
            }
        }
    }

    // ===== HELPER FUNCTIONS =====

    // takes string with following format:
    // word1_word2_..._(wordn)
    // and transforms to following format:
    // Word1 Word2 ... (Wordn)
    const cleanString = (str) => {
        const words = str.split("_");
        for (let i = 0; i < words.length; i++) {
            if (words[i][0] !== "(") {
                words[i] = words[i][0].toUpperCase()+words[i].substr(1) 
            } else {
                words[i] = words[i][0]+words[i][1].toUpperCase()+words[i].substr(2);
            }
        }
        return words.join(" ");
    }

    // function that is used to determine the 'checked' property of the radio button
    const isRadioSelected = (val) => {
        return selectedRadioBtn === val;
    }

    // function that will handle change when radio button is selected
    const handleModeChange = (e) => {
        setSelectedRadioBtn(e.target.value);
    }

    // ===== REACT COMPONENTS =====

    // component used to render the level, with a time and score link component
    const Level = ({id, chartType, isMisc}) => {
        // first, initalize path variables. this will depend on the isMisc variable.
        const scorePath = isMisc ? `/games/${abb}/misc/score/${id}` : `/games/${abb}/main/score/${id}`;
        const timePath = isMisc ? `/games/${abb}/misc/time/${id}` : `/games/${abb}/main/time/${id}`;
        const levelName = cleanString(id);

        // Level components depend on the chartType variable, which can take on 3 different states:
        // score: only the score button should be rendered (if)
        // time: only the time button should be rendered (else if)
        // both: both time and score buttons should be rendered (else)
        if (chartType === 'score') {
            return (
                <tr className="lvl-time-score">
                    <td><p>{levelName}</p></td>
                    <td className="blank"></td>
                    <td><Link to={{pathname: scorePath}}><button>Score</button></Link></td>
                </tr>
            )
        } else if (chartType === 'time') {
            return (
                <tr className="lvl-time-score">
                    <td><p>{levelName}</p></td>
                    <td className="blank"></td>
                    <td><Link to={{pathname: timePath}}><button>Time</button></Link></td>
                </tr>
            )
        } else {
            return (
                <tr className="lvl-time-score">
                    <td><p>{levelName}</p></td>
                    <td><Link to={{pathname: scorePath}}><button>Score</button></Link></td>
                    <td><Link to={{pathname: timePath}}><button>Time</button></Link></td>
                </tr>
            )
        }
    }

    // component used to render the mode, as well as it's levels
    const ModeLevel = ({mode, isMisc}) => {
        // initialize variables
        const [show, setShow] = useState(false);

        return (
            <tbody className="mode-level">
                <tr onClick={()=>setShow(!show)} className="mode-name">
                    <td><h3>{cleanString(mode)}</h3></td>
                    <td className="blank"></td>
                    <td className="blank"></td>
                </tr>
                {isMisc ? 
                    miscLevelModes[mode].map((val) => {
                        return show ? <Level key={val.id} id={val.id} chartType={val.chart_type} isMisc={true}  /> : null
                    })
                    :
                    levelModes[mode].map((val) => {
                        return show ? <Level key={val.id} id={val.id} chartType={val.chart_type} isMisc={false} /> : null
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
                        return <ModeLevel key={val} mode={val} isMisc={false} />
                    })
                    :
                    miscLevelModes["modes"].map((val) => {
                        return <ModeLevel key={val} mode={val} isMisc={true} />
                    })
                }
            </>
        );
    }

    // component used to render links to the totalizer boards
    const TotalizerBoards = () => {
        return (
            <div>
                <Link to={{pathname: `/games/${abb}/${selectedRadioBtn}/totalizer`}}>
                    {selectedRadioBtn === "main" ? 
                        <p>Score & Time Totalizers</p>
                        :    
                        <p>Misc. Score & Time Totalizers</p>
                    }
                </Link>
            </div>
        );
    }

    // component used to render links to the medal table boards
    const MedalTableBoards = () => {
        return (
            <div>
                <Link to={{pathname: `/games/${abb}/${selectedRadioBtn}/medals`}}>
                    {selectedRadioBtn === "main" ?
                        <p>Score & Time Medal Tables</p>
                        :
                        <p>Misc. Score & Time Medal Tables</p>
                    }
                </Link>
            </div>
        )
    }

    // component used to render links to the world record page for a given mode
    const WorldRecordBoards = ({ mode }) => {
        return (
            <div>
                <Link to={ { pathname: `/games/${ abb }/${ selectedRadioBtn }/${ mode.toLowerCase() }` } }>
                    {selectedRadioBtn === "main" ?
                        <p>{ mode } World Records</p>
                        :
                        <p>Misc. { mode } World Records</p>
                    }
                </Link>
            </div>
        );
    }
    
    return { loading,
            title, 
            getModesLevels, 
            isRadioSelected, 
            handleModeChange, 
            ModeLevelTable,
            TotalizerBoards,
            MedalTableBoards,
            WorldRecordBoards
        };
}

export default GameInit;