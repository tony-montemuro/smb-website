import { React, useEffect } from "react";
import ProfileInit from "./ProfileInit";
import Avatar from "../../components/Avatar/Avatar";
import "./profile.css";

function Profile({ session }) {
    const { loading,
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
            signOut,
            CountrySelect
    } = ProfileInit();

    useEffect(() => {
        checkForUser(session);
        getProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (usernameError.length === 0 && isSubmit) {
            updateProfile();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usernameError]);

  return (
    <div className="profile">
        {loading ? (
            "Saving..."
         ) : 
            <form onSubmit={handleSubmit}>
            <p>Email: {session.user.email}</p>
            <div>
                <label htmlFor="username">Username: </label>
                <input 
                    id="username"
                    type="text"
                    placeholder="username"
                    value={username || ""}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <label htmlFor="countryId">Country (optional): </label>
            <CountrySelect />
            <p>{usernameError !== "initState" ? usernameError : ""}</p>
            <div>
                <label htmlFor="youtube-url">YouTube URL (optional): </label>
                <input
                    id="youtube-url"
                    type="url"
                    placeholder="https://www.youtube.com/yourChannelUrl"
                    value={youtube_url || ""}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="twitch-url">Twitch URL (optional): </label>
                <input 
                    id="twitch-url"
                    type="url"
                    placeholder="https://www.twitch.tv/yourTwitch"
                    value={twitch_url || ""}
                    onChange={(e) => setTwitchUrl(e.target.value)}
                />
            </div>
            <div>
                <Avatar 
                    url={avatar_url}
                    size={150}
                    onUpload={(url) => {
                        setAvatarUrl(url);
                    }}
                />
            </div>
            <div>
                <button disabled={updating}>Update Profile</button>
                {isUpdated ? <p>Your profile has been updated.</p> : ""}
            </div>
        </form>
        }
        <button onClick={navToProfile}>View Profile</button>
        <button onClick={signOut}> Sign Out</button>
    </div>
  )
}

export default Profile;