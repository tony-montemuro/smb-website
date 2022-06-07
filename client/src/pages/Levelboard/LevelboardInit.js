import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Axios from 'axios';

const LevelboardInit = () => {

    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // navigate used for redirecting
    const navigate = useNavigate();

    // states
    const [records, setRecords] = useState([]);
    const [title, setTitle] = useState("");
    const [levelList, setLevelList] = useState([]);
    
    // path variables
    const path = window.location.pathname;
    const pathArr = path.split("/");
    const abb = pathArr[2];
    const mode = capitalize(pathArr[3]);
    let levelId = parseInt(pathArr[4]);

    // offset variables
    const smb1TotalLevels = 9;
    
    const checkPath = () => {
        let approvedGame = false;
        let approvedMode = false;

        // now, query the list of games. if the current url matches any of these
        // it is an approved path
        Axios.get("http://localhost:3001/games").then((response) => {
            const data = response.data;
            data.forEach(element => {
                const gameAbb = element.abb;
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
        });
    };

    const getRecords = () => {
        if (mode === "Time") {
            levelId += smb1TotalLevels;
        }
        Axios.get(`http://localhost:3001/games/${abb}/${mode}/${levelId}`).then((response) => {
            let r = response.data;
            // if querying a time chart, we need to fix it so that each time has two
            // decimal places.
            if (mode === "Time") {
                for (let record of r) {
                    record.Time = record.Time.toFixed(2);
                }
            }
            setRecords(r);
        });
    }

    const generateLevelList = (modes) => {
        let endpoints = [];
        let lvlList = [];

        modes.forEach((mode) => {
            endpoints.push(`http://localhost:3001/games/${abb}/${mode}`);
        });

        Promise.all(endpoints.map((endpoint) => Axios.get(endpoint)))
        .then(Axios.spread((...response) => {
                response.forEach((response) => {
                    response.data.forEach((level) => {
                        lvlList.push(level.name);
                    });
                });
                setTitle(`${lvlList[levelId-1]} - ${mode}`);
                setLevelList(lvlList)
                getRecords();
            }))
        .catch(err => console.log(err));
    }

    const getTitleAndRecords = () => {
        Axios.get(`http://localhost:3001/games/${abb}/modes`).then((response) => {
            const modeList = response.data;
            generateLevelList(modeList);
        })
    }

    const swapLevels = (id) => {
        navigate(`/games/${abb}/${getMode(true)}/${id}`);
        window.location.reload();
    }
    
    const getGame = () => {
        return abb;
    }

    const getMode = (lower) => {
        // if lower is true, return the mode in lowercase. otherwise, simply return mode.
        return lower ? pathArr[3] : mode;
    }

    const getLevelId = (increment) => {
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

    return { records, title, checkPath, getTitleAndRecords, swapLevels, getGame, getMode, getLevelId };
}

export default LevelboardInit;