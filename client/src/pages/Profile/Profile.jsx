import "./profile.css";
import React, { useEffect } from "react";
import ProfileInit from "./ProfileInit";
import Avatar from "../../components/Avatar/Avatar";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

function Profile() {
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
        checkForUser();
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
        <h1>Edit Your Profile</h1>
        {loading ? (
            "Loading..."
         ) : 
         <div className="profile-body">
            <form onSubmit={handleSubmit}>
                <div className="profile-entry">
                    <label htmlFor="username">Username: </label>
                    <input 
                        id="username"
                        type="text"
                        placeholder="username"
                        value={username || ""}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                {usernameError === "initState" || usernameError === "" ? "" : <p>{usernameError}</p>}
                <label htmlFor="countryId">Country (optional): </label>
                <CountrySelect />
                <div className="profile-entry">
                    <label htmlFor="youtube-url">YouTube URL (optional): </label>
                    <input
                        id="youtube-url"
                        type="url"
                        placeholder="https://www.youtube.com/yourChannelUrl"
                        value={youtube_url || ""}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                    />
                </div>
                <div className="profile-entry">
                    <label htmlFor="twitch-url">Twitch URL (optional): </label>
                    <input 
                        id="twitch-url"
                        type="url"
                        placeholder="https://www.twitch.tv/yourTwitch"
                        value={twitch_url || ""}
                        onChange={(e) => setTwitchUrl(e.target.value)}
                    />
                </div>
                <div className="profile-entry">
                    <Avatar 
                        url={ avatar_url }
                        size={ 150 }
                        userId={ supabase.auth.user().id }
                        onUpload={ (url) => {
                            setAvatarUrl(url);
                        } }
                    />
                </div>
                <div>
                    <button disabled={updating}>Update Profile</button>
                    {isUpdated ? <p className="p-update">Your profile has been updated.</p> : ""}
                </div>
            </form>
            <div className="profile-btns">
                <button className="profile-btn" onClick={navToProfile}>View Profile</button>
                <button className="profile-btn" onClick={signOut}> Sign Out</button>
            </div>   
         </div>
        }
    </div>
  )
}

export default Profile;