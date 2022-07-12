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

    // function used to make sure a valid user is being viewed
    const checkForUser = async () => {
        try {
            let { data: profiles, error } = await supabase
                .from('profiles')
                .select('id');

            if (error) {
                throw error;
            }
            
            let validUser = false;
            console.log("Profiles: ");
            console.log(profiles);
            for (let profile of profiles) {
                if (userId === profile.id) {
                    validUser = true;
                }
            }

            if (!validUser) {
                navigate("/");
            }
        } catch (error) {
            alert(error.message);
        }
    }

    // function used to grab a countries name using it's id. if the id is null,
    // the name will be set to an empty string
    const getCountry = async (id) => {
        try {
            if (id !== null) {
                let {data, error, status} = await supabase
                    .from("countries")
                    .select("*")
                    .eq("iso2", id)
                    .single()

                if (error && status !== 406) {
                    throw error;
                }

                setCountry(data);
            } else {
                setCountry("");
            }

        } catch (error) {
            alert(error.message);
        } finally {
            setLoadingUser(false);
        }
    }

    // function used to load a user from the database given the user id in the url
    const loadUser = async () => {
        try {
            await checkForUser();
            let { data: userData, error, status } = await supabase
                .from("profiles")
                .select("username, country, youtube_url, twitch_url, avatar_url")
                .eq("id", userId)
                .single()

            if (error && status !== 406) {
                throw error;
            }

            console.log(userData.avatar_url);

            setUsername(userData.username);
            setYoutubeUrl(userData.youtube_url);
            setTwitchUrl(userData.twitch_url);
            setAvatarUrl(userData.avatar_url);

            getCountry(userData.country);
        } catch(error) { 
            console.log(error.message);
        }
    }

    // function used to query the list of games
    // function that queries the list of games from the database
    const queryGameList = async () => {
        try {
            let { data, error, status } = await supabase
                .from("games")
                .select("name, abb, is_custom")

            if (error && status !== 406) {
                throw error;
            }

            // now, separate the games into normal and custom levels
            let games = [];
            let customGames = [];
            data.forEach(game => {
                if (game.is_custom) {
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
             loadUser,
             queryGameList
    }
}

export default UserInit;