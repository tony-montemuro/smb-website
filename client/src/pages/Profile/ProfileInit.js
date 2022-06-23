import { useState } from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useNavigate } from "react-router-dom";

const ProfileInit = () => {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);

    const navigate = useNavigate();

    const getProfile = async () => {
        try {
            const user = supabase.auth.user();

            let { data, error, status } = await supabase
                .from("profiles")
                .select("username, avatar_url")
                .eq("id", user.id)
                .single()

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setUsername(data.username);
                setAvatarUrl(data.avatar_url);
            }
        } catch(error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    const updateProfile = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const user = supabase.auth.user();

            const updates = {
                id: user.id,
                username,
                avatar_url
            }

            let { error } = await supabase.from('profiles').upsert(updates, {
                returning: "minimal", // Don't return the value after inserting
            });

            if (error) {
                throw error;
            }
        } catch(error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    const signOut = async (e) => {
        supabase.auth.signOut();
        navigate("/");
    }

    return { loading, username, avatar_url, setUsername, setAvatarUrl, getProfile, updateProfile, signOut };
}

export default ProfileInit;