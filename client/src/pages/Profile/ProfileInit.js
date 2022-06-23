import { useState } from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useNavigate } from "react-router-dom";

const ProfileInit = () => {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [username, setUsername] = useState(null);
    const [youtube_url, setYoutubeUrl] = useState(null);
    const [twitch_url, setTwitchUrl] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);
    const [usernameError, setUsernameError] = useState("initState");
    const [isSubmit, setIsSubmit] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);

    const navigate = useNavigate();

    const checkForUser = (session) => {
        if (!session) {
            navigate("/");
        }
    }

    const getProfile = async () => {
        try {
            const user = supabase.auth.user();

            let { data, error, status } = await supabase
                .from("profiles")
                .select("username, youtube_url, twitch_url, avatar_url")
                .eq("id", user.id)
                .single()

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setUsername(data.username);
                setYoutubeUrl(data.youtube_url);
                setTwitchUrl(data.twitch_url)
                setAvatarUrl(data.avatar_url);
            }
        } catch(error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setUsernameError(validate(username));
        setIsSubmit(true);
    }

    const updateProfile = async (e) => {
        try {
            setUpdating(true);
            const user = supabase.auth.user();

            const updates = {
                id: user.id,
                username,
                youtube_url,
                twitch_url,
                avatar_url
            }

            let { error } = await supabase.from('profiles').upsert(updates, {
                returning: "minimal", // Don't return the value after inserting
            });

            if (error) {
                throw error;
            }

            setIsUpdated(true);
        } catch(error) {
            if (error.code === "23505") {
                setUsernameError("Error: Username already taken.");
            }
        } finally {
            setUpdating(false);
        }
    }

    const validate = (username) => {
        let error = "";
        const regex = new RegExp('^[A-Za-z0-9_]*$');

        if (!username) {
            error = "Error: Username is required to create a profile!";
        }

        if (username.length < 5 || username.length > 25) {
            error = "Error: Username must be between 5 and 25 characters long.";
        }

        if (!regex.test(username)) {
            error = "Error: Username must consist only of letters, numbers, and/or underscores.";
        }

        return error;
    }

    const navToProfile = () => {
        const userId = supabase.auth.user().id;
        navigate(`/user/${userId}`);
    }

    const signOut = async (e) => {
        supabase.auth.signOut();
        navigate("/");
    }

    return { loading,
            updating,
            username, 
            youtube_url,
            twitch_url,
            avatar_url,
            usernameError,
            isSubmit,
            isUpdated,
            setUsername,
            setYoutubeUrl,
            setTwitchUrl,
            setAvatarUrl, 
            checkForUser,
            getProfile, 
            handleSubmit,
            updateProfile,
            navToProfile,
            signOut
    };
}

export default ProfileInit;