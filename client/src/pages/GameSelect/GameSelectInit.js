import {useState} from 'react';
import {supabase} from '../../components/SupabaseClient/SupabaseClient';

const GameSelectInit = () => {
    
    //states
    const [gameList, setGameList] = useState([]);
    const [customGameList, setCustomGameList] = useState([]);

    // function that makes a call to the backend server to get the list of games
    const getGames = async () => {
        let main = [];
        let custom = [];

        try {
            let {data: games, error, status} = await supabase
                .from("games")
                .select("*");
            
            if (error && status !== 406) {
                throw error;
            }

            games.forEach((game) => {
                if (game.is_custom) {
                    custom.push(game);
                } else {
                    main.push(game);
                }
            });

            console.log(main);
            console.log(custom);
            setGameList(main);
            setCustomGameList(custom);
        } catch(error) {
            alert(error.message);
        }
    }

    return { gameList, customGameList, getGames };
}

export default GameSelectInit;