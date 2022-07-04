import "./user.css";
import UserInit from "./UserInit";
import { React, useEffect } from "react";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function User() {
  const { username,
         country,
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
                <div className="country">
                  <p>{country.name}</p>
                  <img
                    alt={country.iso2}
                    src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${country.iso2}.svg`}
                    style={{width: 30}}>
                  </img>
                </div>
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