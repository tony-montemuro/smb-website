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

            return validUser;
        } catch (error) {
            alert(error.message);
            return false;
        }
    }

    // function used to grab a countries name using it's id. if the id is null,
    // the name will be set to an empty string
    const getCountry = async (id) => {
        try {
            // only need to perform query if id exists. otherwise, we can set country to blank string
            if (id !== null) {
                // get country information for country with iso2 of country
                let {data, error, status} = await supabase
                    .from("countries")
                    .select("*")
                    .eq("iso2", id)
                    .single()

                if (error && status !== 406) {
                    throw error;
                }

                // update hook for country
                setCountry(data);
            } else {
                // update hook to blank string
                setCountry("");
            }

        } catch (error) {
            alert(error.message);
        } finally {
            // user is fully loaded, so update hook
            setLoadingUser(false);
        }
    }

    // function used to load a user from the database given the user id in the url
    const loadUser = async () => {
        try {
            // first, check if valid user in url. if not, redirect to home
            if (await checkForUser()) {
                // query profiles table for user information
                let { data: userData, error, status } = await supabase
                    .from("profiles")
                    .select("username, country, youtube_url, twitch_url, avatar_url")
                    .eq("id", userId)
                    .single()

                if (error && status !== 406) {
                    throw error;
                }

                console.log(userData.avatar_url);

                // update hooks for each field of data
                setUsername(userData.username);
                setYoutubeUrl(userData.youtube_url);
                setTwitchUrl(userData.twitch_url);
                setAvatarUrl(userData.avatar_url);

                // finally, we get the country information from the countries table
                getCountry(userData.country);
            }
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
                .order("name");

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