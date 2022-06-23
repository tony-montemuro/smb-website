import { React, useEffect } from "react";
import ProfileInit from "./ProfileInit";
import Avatar from "../../components/Avatar/Avatar";
import "./profile.css";

function Profile({ session }) {
    const { loading, username, avatar_url, setUsername, setAvatarUrl, getProfile, updateProfile, signOut } = ProfileInit();

    useEffect(() => {
        getProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  return (
    <div className="profile">
        {loading ? (
            "Saving..."
         ) : 
            <form onSubmit={updateProfile}>
            <p>Email: {session.user.email}</p>
            <div>
                <label htmlFor="username">Username: </label>
                <input 
                    id="username"
                    type="text"
                    value={username || ""}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div>
                <Avatar 
                    url={avatar_url}
                    size={150}
                    onUpload={(url) => {
                        setAvatarUrl(url);
                        updateProfile( { username, avatar_url: url } );
                    }}
                />
            </div>
            <div>
                <button disabled={loading}>Update Profile</button>
            </div>
        </form>
        }
        <button onClick={signOut}> Sign Out</button>
    </div>
  )
}

export default Profile;