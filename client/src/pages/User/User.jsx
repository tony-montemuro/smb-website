import "./user.css";
import "/node_modules/flag-icons/css/flag-icons.min.css";
import UserInit from "./UserInit";
import { React, useEffect } from "react";
import YT from "../../img/yt-logo.png";
import Twitch from "../../img/twitch-logo.png";
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
         setLoadingUser,
         loadUser,
         queryGameList,
         GameBody
    } = UserInit();

  useEffect(() => {
    loadUser();
    queryGameList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // this is a clever way of checking if both queries have completed. if both are true, queries complete,
    // and we proceed to render front-end
    if (country && customGameList.length > 0) {
      setLoadingUser(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, customGameList]);

  return (
    <div className="user">
        {loadingUser || loadingGameList ?
            <p>Loading...</p>
        : 
          <div className="view-profile">
            <div className="user-profile">
              <div className="user-info">
                <h2>{username}</h2>
                {country ? 
                  <div className="user-country-name">
                    <span className={`fi fi-${country.iso2.toLowerCase()}`}></span>
                    <p>{country.name}</p>
                  </div>
                :
                  ""
                }
                {youtube_url ? <a 
                    href={youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer"><img className="social-media-logo" alt="yt-logo" src={ YT }></img></a>
                : 
                ""}
                {twitch_url ? <a 
                    href={twitch_url} 
                    target="_blank" 
                    rel="noopener noreferrer"><img className="social-media-logo" alt="twitch-logo" src={ Twitch }></img></a> 
                : 
                ""}
              </div>
              <div className="user-image">
                <SimpleAvatar key="avatar" url={avatar_url} size={300} />
              </div>
            </div>
              <div className="user-stats-games">
                <h1>View Player Stats</h1>
                <table>
                  <thead>
                    <tr>
                      <th colSpan={3}>Main Games</th>
                    </tr>
                  </thead>
                  <GameBody list={ gameList } />
                </table>
                <table>
                  <thead>
                    <tr>
                      <th colSpan={3}>Custom Games</th>
                    </tr>
                  </thead>
                  <GameBody list={ customGameList } />
                </table>
              </div> 
          </div>
        }
    </div>
  );
}

export default User;