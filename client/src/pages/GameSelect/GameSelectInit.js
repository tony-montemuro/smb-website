import {useState} from "react";
import {supabase} from "../../components/SupabaseClient/SupabaseClient";

const GameSelectInit = () => {
    // states
    const [loading, setLoading] = useState(true);
    const [gameList, setGameList] = useState([]);
    const [customGameList, setCustomGameList] = useState([]);

    // functions

    // function that makes a call to the backend server to get the list of games
    const getGames = async () => {
        let main = [];
        let custom = [];

        try {
            let {data: games, error, status} = await supabase
                .from("games")
                .select("*")
                .order("name");
            
            if (error && status !== 406) {
                throw error;
            }

            // separate the main games from custom games into their own lists
            games.forEach(game => {
                game.is_custom ? custom.push(game) : main.push(game);
            });

            console.log(main);
            console.log(custom);
            setGameList(main);
            setCustomGameList(custom);
            setLoading(false);
        } catch(error) {
            alert(error.message);
        }
    }

    return { loading, gameList, customGameList, getGames };
}

export default GameSelectInit;