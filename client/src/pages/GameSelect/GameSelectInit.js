import {useState} from 'react';
import {supabase} from '../../components/SupabaseClient/SupabaseClient';

const GameSelectInit = () => {
    
    const [gameList, setGameList] = useState([]);

    // function that makes a call to the backend server to get the list of games
    const getGames = async () => {
        try {
            let {data: games, error, status} = await supabase
                .from("games")
                .select("*");
            
            if (error && status !== 406) {
                throw error;
            }

            console.log(games);
            setGameList(games);
        } catch(error) {
            alert(error.message);
        }
    }

    return { gameList, getGames };
}

export default GameSelectInit;