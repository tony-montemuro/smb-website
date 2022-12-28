import { useState } from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

const GameSelectInit = () => {
    /* ===== STATES ===== */
    const [loading, setLoading] = useState(true);
    const [gameLists, setGameLists] = useState({ main: [], custom: [] });

    /* ===== FUNCTIONS ===== */

    // function that makes a call to the backend server to get the list of games
    const getGames = async () => {
        // initialize two arrays. these are used to store list of games
        let main = [];
        let custom = [];

        try {
            // query the game table for the list of games
            let {data: games, error, status} = await supabase
                .from("game")
                .select("abb, name, custom")
                .order("id");
            
            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // separate the main games from custom games into their own lists
            games.forEach(game => {
                game.custom ? custom.push(game) : main.push(game);
            });
            
            // once this is complete, update react state hooks
            setGameLists({ main: main, custom: custom });
            setLoading(false);

            // print statements for debugging
            console.log(games);
            console.log(main);
            console.log(custom);

        } catch(error) {
            console.log(error.message);
            alert(error.message);
        }
    };

    return { loading, gameLists, getGames };
};

export default GameSelectInit;