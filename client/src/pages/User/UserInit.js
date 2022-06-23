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
    const [youtube_url, setYoutubeUrl] = useState(null);
    const [twitch_url, setTwitchUrl] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(true);

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
            console.log("HIT ERROR 1");
            alert(error.message);
        }
    }

    const loadUser = async () => {
        try {
            await checkForUser();
            let { data: userData, error, status } = await supabase
                .from("profiles")
                .select("username, youtube_url, twitch_url, avatar_url")
                .eq("id", userId)
                .single()

            if (error && status !== 406) {
                throw error;
            }

            setUsername(userData.username);
            setYoutubeUrl(userData.youtube_url);
            setTwitchUrl(userData.twitch_url);
            setAvatarUrl(userData.avatar_url);

            setLoading(false);
        } catch(error) { 
            console.log(error.message);
        }
    }

    return { username,
             youtube_url, 
             twitch_url, 
             avatar_url, 
             loading, 
             loadUser
    }
}

export default UserInit;