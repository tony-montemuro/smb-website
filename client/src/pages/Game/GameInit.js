import {useState} from 'react';
import Axios from 'axios';
import {useNavigate, Link} from 'react-router-dom';

const GameInit = () => {
    
    const navigate = useNavigate();

    // states
    const [levelModes, setLevelModes] = useState({modes: []});
    
    // path variables
    const path = window.location.pathname;
    const abb = path.split("/")[2];

    // level id varaibles
    let currentLevelId = 0;

    const checkPath = () => {
        let approved = false;

        // now, query the list of games. if the current url matches any of these
        // it is an approved path
        Axios.get("http://localhost:3001/games").then((response) => {
            const data = response.data;
            data.forEach(element => {
                const gameAbb = element.abb;
                if (abb === gameAbb) {
                    approved = true;
                }
            });

            // if not approved, navigate back to home. otherwise, proceed.
            if (!approved) {
                navigate("/");
            }
        });

    };
    
    // function that converts a normal string to one in snake case
    const toSnake = (str) => {
        str = str.toLowerCase();
        str = str.replace(' ', '_');
        return str;
    };

    // function that makes a call to the backend server to get the list of levels
    const getLevels = (modes) => {
        // init variables
        let i = 0;
        let endpoints = [];
        let levelModesObj = {modes: []};

        // create endpoints for each mode
        modes.forEach((mode) => {
            endpoints.push(`http://localhost:3001/games/${abb}/${mode}`);
            levelModesObj["modes"].push(mode);
        });

        // now, query each endpoint to get the lists of levels for each mode. each of
        // these lists will then be added to the 'levelModesObj'.
        Promise.all(endpoints.map((endpoint) => Axios.get(endpoint)))
        .then(Axios.spread((...response) => {
                response.forEach((response) => {
                    levelModesObj[toSnake(modes[i])] = response.data;
                    i++;
                });
                setLevelModes(levelModes => ({
                    ...levelModes,
                    ...levelModesObj
                }));
                console.log(levelModesObj);
            })
        )
        .catch(err => console.log(err));
    };

    // function that makes a call to the backend server to get the list of modes
    const getModesLevels = async () => {
        Axios.get(`http://localhost:3001/games/${abb}/modes`)
        .then((response) => {
            // now, get the list of levels
            getLevels(response.data);
        })
        .catch(err => console.log(err));
    };

    // component used to render the level, with a time and score link component
    const Level = ({val}) => {
        currentLevelId++;

        return (
            <div className="lvl-time-score">
                <p>{val}</p>
                <Link to={{pathname: `time/${currentLevelId}`}}>Time </Link>
                <Link to={{pathname: `score/${currentLevelId}`}}>Score</Link>
            </div>
        )
    }

    // component used to render the mode, as well as it's levels
    const ModeLevel = ({child}) => {
        const snake_mode = toSnake(child);

        return (
            <div className="mode-level">
                <h3>{child}</h3>
                {levelModes[snake_mode].map((val) => {
                    return <Level val={val.name} />
                })}
            </div>
        );
    }

    return { levelModes, checkPath, getModesLevels, ModeLevel };
}

export default GameInit;