import {useState} from 'react';
import Axios from 'axios';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

const GameInit = () => {
    
    const [modeList, setModeList] = useState([]);
    const navigate = useNavigate();
    const path = window.location.pathname;
    const abb = path.split("/")[2];

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

    }

    // function that makes a call to the backend server to get the list of levels
    const getLevels = (modes) => {
        // create endpoints for each mode
        let endpoints = [];
        modes.forEach((mode) => {
            endpoints.push(`http://localhost:3001/games/${abb}/${mode}`);
        });
        
        Promise.all(endpoints.map((endpoint) => axios.get(endpoint))).then(
            axios.spread((...response) => {
                response.forEach((response) => {
                    console.log(response.data);
                })
            })
        );
    };

    // function that makes a call to the backend server to get the list of modes
    const getModesLevels = async () => {
        console.log("before");
        Axios.get(`http://localhost:3001/games/${abb}/modes`)
        .then((response) => {
            setModeList(response.data);
            getLevels(response.data);
        })
        .catch(err => console.log(err));
    };

    return { modeList, checkPath, getModesLevels };
}

export default GameInit;