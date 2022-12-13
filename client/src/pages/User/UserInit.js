import { useState } from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useNavigate } from "react-router-dom";

const UserInit = () => {
    //variables
    const path = window.location.pathname;
    const pathArr = path.split("/");
    const userId = pathArr[2];
    const navigate = useNavigate();

    // states
    const [username, setUsername] = useState(null);
    const [country, setCountry] = useState(null);
    const [youtube_url, setYoutubeUrl] = useState(null);
    const [twitch_url, setTwitchUrl] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingGameList, setLoadingGameList] = useState(true);
    const [gameList, setGameList] = useState([]);
    const [customGameList, setCustomGameList] = useState([]);

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

            if (error || status === 406) {
                throw error;
            }

            console.log(userData);

            // update hooks for each field of data
            setUsername(userData.username);
            setYoutubeUrl(userData.youtube_url);
            setTwitchUrl(userData.twitch_url);
            setAvatarUrl(userData.avatar_url);
            setCountry(userData.country);

        } catch(error) { 
            if (error.code === '22P02' || error.code === 'PGRST116') {
                navigate("/");
            } else {
                console.log(error);
                alert(error);
            }
        }
    }

    // function used to query the list of games
    // function that queries the list of games from the database
    const queryGameList = async () => {
        try {
            // query game table for game information
            let { data: gameArr, error, status } = await supabase
                .from("game")
                .select("*")
                .order("name");

            if (error && status !== 406) {
                throw error;
            }

            // now, separate the games into normal and custom levels
            let games = [];
            let customGames = [];
            gameArr.forEach(game => {
                if (game.custom) {
                    customGames.push(game);
                } else {
                    games.push(game);
                }
            });

            // finally, update states
            console.log("Game List");
            console.log(games);
            console.log("Custom List");
            console.log(customGames);
            setGameList(games);
            setCustomGameList(customGames);
    
        } catch (error) {
            alert(error.message);
        } finally {
            setLoadingGameList(false);
        }
    }

    return { username,
             country,
             youtube_url, 
             twitch_url, 
             avatar_url, 
             loadingUser,
             loadingGameList, 
             gameList,
             customGameList,
             setLoadingUser,
             loadUser,
             queryGameList
    }
}

export default UserInit;