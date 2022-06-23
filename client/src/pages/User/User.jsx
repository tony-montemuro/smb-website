import "./user.css";
import UserInit from "./UserInit";
import { React, useEffect } from "react";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function User() {
  const { username,
         youtube_url, 
         twitch_url, 
         avatar_url, 
         loading, 
         loadUser, 
    } = UserInit();

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="user">
        {loading ?
            <p>Loading...</p>
        : 
            <div className="view-profile">
                <p>{username}</p>
                <SimpleAvatar url={avatar_url} size={200} />
                {youtube_url ? <a 
                    href={youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer">YouTube</a>
                : 
                ""}
                {twitch_url ? <a 
                    href={twitch_url} 
                    target="_blank" 
                    rel="noopener noreferrer">Twitch</a> 
                : 
                ""}
            </div>
            
        }
    </div>
  );
}

export default User;