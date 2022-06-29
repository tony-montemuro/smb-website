import { useState } from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useNavigate } from "react-router-dom";

const ProfileInit = () => {
    // states
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [username, setUsername] = useState(null);
    const [youtube_url, setYoutubeUrl] = useState(null);
    const [twitch_url, setTwitchUrl] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);
    const [usernameError, setUsernameError] = useState("initState");
    const [isSubmit, setIsSubmit] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);

    // navigate used for redirecting
    const navigate = useNavigate();

    // function that checks for an active session. if none is found, redirct to home.
    const checkForUser = (session) => {
        if (!session) {
            navigate("/");
        }
    }

    // function that grabs user data from the database
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

    // function that activates when user tries to submit profile changes. will move on to
    // updateProfile function if inputs are validated.
    const handleSubmit = (e) => {
        e.preventDefault();
        setUsernameError(validate(username));
        setIsSubmit(true);
    }

    // function that will push new user data into the profiles table
    const updateProfile = async (e) => {
        try {
            setUpdating(true);
            let avatarUrl = avatar_url;

            console.log(avatar_url);
            if (!avatar_url) {
                setAvatarUrl("default.png");
                avatarUrl = "default.png";
            }

            const user = supabase.auth.user();

            const updates = {
                id: user.id,
                username,
                youtube_url,
                twitch_url,
                avatar_url: avatarUrl
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


    // function used to check for valid inputs
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

    // function that will navigate to the 'user' page, which is similar to the profile page,
    // but is view only. this page is viewable to all users.
    const navToProfile = () => {
        const userId = supabase.auth.user().id;
        navigate(`/user/${userId}`);
    }

    // function that will sign the user out, and navigate them back to the home screen.
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