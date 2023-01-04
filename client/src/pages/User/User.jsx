import "./user.css";
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { React, useEffect } from "react";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";
import Twitch from "../../img/twitch-logo.png";
import UserInit from "./UserInit";
import YT from "../../img/yt-logo.png";

function User() {
  // states and functions from the init file
  const {
    user,
    loading,
    games,
    setLoading,
    loadUser,
    queryGameList
  } = UserInit();

  // helper functions
  const { capitalize } = FrontendHelper();

  // code that is executed when the page first loads
  useEffect(() => {
    loadUser();
    queryGameList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // code that is executed once both queries have completed
  useEffect(() => {
    if (user && games) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, games]);

  // user component
  return (
    <>
      { loading ?
          <p>Loading...</p>
      : 
        <>
          <div className="user-profile">
            <div className="user-info">
              <h2>{ user.username }</h2>
              { user.country ? 
                <div className="user-country-name">
                  <span className={ `fi fi-${ user.country.iso2.toLowerCase() }` }></span>
                  <p>{ user.country.name }</p>
                </div>
              :
                null
              }
              { user.youtube_url ? 
                <a href={ user.youtube_url } target="_blank" rel="noopener noreferrer">
                <img className="social-media-logo" alt="yt-logo" src={ YT }></img></a>
              : 
                null
              }
              { user.twitch_url ? 
                <a href={ user.twitch_url } target="_blank" rel="noopener noreferrer">
                <img className="social-media-logo" alt="twitch-logo" src={ Twitch }></img></a> 
              : 
                null
              }
            </div>
            <div className="user-image">
              <SimpleAvatar url={ user.avatar_url } size={ 300 } />
            </div>
          </div>
          <div className="user-stats-games">
            <h1>View Player Stats</h1>
            { Object.keys(games).map(gameType => {
              return (
                <table key={ gameType }>
                  <thead>
                    <tr>
                      <th colSpan={ 3 }>{ capitalize(gameType) } Games</th>
                    </tr>
                  </thead>
                  <tbody>
                    { games[gameType].map(game => {
                      return (
                        <tr key={ game.name }>
                          <td>{ game.name }</td>
                          <td><Link className="user-stats-link" to={ { pathname: `${game.abb}/main` } }>Main</Link></td>
                          <td><Link className="user-stats-link" to={ { pathname: `${game.abb}/misc` } }>Misc</Link></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })}
          </div> 
        </>
      }
    </>
  );
};

export default User;