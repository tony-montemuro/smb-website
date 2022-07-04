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
    const [loading, setLoading] = useState(true);

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
    
            setLoading(false);
        } catch (error) {
            alert(error.message);
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

            setUsername(userData.username);
            setYoutubeUrl(userData.youtube_url);
            setTwitchUrl(userData.twitch_url);
            setAvatarUrl(userData.avatar_url);

            getCountry(userData.country);
        } catch(error) { 
            console.log(error.message);
        }
    }

    return { username,
             country,
             youtube_url, 
             twitch_url, 
             avatar_url, 
             loading, 
             loadUser
    }
}

export default UserInit;