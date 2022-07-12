import "./user.css";
import UserInit from "./UserInit";
import { React, useEffect } from "react";
import { Link } from "react-router-dom";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function User() {
  const { username,
         country,
         youtube_url, 
         twitch_url, 
         avatar_url, 
         loadingUser,
         loadingGameList, 
         gameList,
         customGameList,
         loadUser,
         queryGameList
    } = UserInit();

  useEffect(() => {
    loadUser();
    queryGameList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="user">
        {loadingUser || loadingGameList ?
            <p>Loading...</p>
        : 
          <div className="view-profile">
            <div className="user-profile">
              <p>{username}</p>
                {country ? 
                  <div className="country">
                    <p>{country.name}</p>
                    <img
                      alt={country.iso2}
                      src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${country.iso2}.svg`}
                      style={{width: 30}}>
                    </img>
                  </div>
                :
                  ""
                }
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
              <div className="user-stats">
                <h1>View Player Stats</h1>
                <h2>Main Games</h2>
                {gameList.map(val => {
                  return <Link key={val.abb} to={{ pathname: val.abb}}><p>{val.name}</p></Link>
                })}
                <h2>Custom Games</h2>
                {customGameList.map(val => {
                  return <Link key={val.abb} to={{ pathname: val.abb}}><p>{val.name}</p></Link>
                })}
              </div> 
          </div>
        }
    </div>
  );
}

export default User;