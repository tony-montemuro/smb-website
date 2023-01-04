import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

const UserInit = () => {
    /* ===== VARIABLES ===== */
    const path = window.location.pathname;
    const pathArr = path.split("/");
    const userId = pathArr[2];
    const navigate = useNavigate();

    /* ===== STATES ===== */
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [games, setGames] = useState(null);

    /* ===== FUNCTIONS ===== */

    // function used to load a user from the database given the user id in the url
    const loadUser = async () => {
        try {
            // query profiles table for user information
            let { data: userData, error, status } = await supabase
                .from("profiles")
                .select(`
                    username, 
                    country (iso2, name), 
                    youtube_url, 
                    twitch_url, 
                    avatar_url
                `)
                .eq("id", userId)
                .single();

            // error hanndling
            if (error || status === 406) {
                throw error;
            }

            // update user hook
            setUser(userData);
            console.log(userData);

        } catch(error) { 
            if (error.code === '22P02' || error.code === 'PGRST116') {
                console.log("Error: Invalid user.");
            } else {
                console.log(error);
                alert(error.message);
            }
            navigate("/");
        }
    };

    // function that queries the list of games from the database
    const queryGameList = async () => {
        try {
            // query game table for game information
            let { data: gameArr, error, status } = await supabase
                .from("game")
                .select("*")
                .order("name");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // now, separate the games into normal and custom levels
            let games = [], customGames = [];
            gameArr.forEach(game => game.custom ? customGames.push(game) : games.push(game));

            // finally, update game state hook
            console.log("Game List");
            console.log(games);
            console.log("Custom List");
            console.log(customGames);
            setGames({ main: games, custom: customGames });
    
        } catch (error) {
            console.log(error);
            alert(error.message);
            navigate("/");
        }
    };

    return {  
        user,
        loading,
        games,
        setLoading,
        loadUser,
        queryGameList
    }
}

export default UserInit;