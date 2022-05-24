import {useState} from 'react';
import Axios from 'axios';

const GameSelectInit = () => {
    
    const [gameList, setGameList] = useState([]);

    // function that makes a call to the backend server to get the list of games
    const getGames = () => {
        Axios.get('http://localhost:3001/games').then((response) => {
            setGameList(response.data);
            console.log(response.data);
        });
    };

    return { gameList, getGames };
}

export default GameSelectInit;