import "./user.css";
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { React, useEffect } from "react";
import { Link } from "react-router-dom";
import Discord from "../../img/discord-logo.png";
import FrontendHelper from "../../helper/FrontendHelper";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";
import Twitch from "../../img/twitch-logo.png";
import UserInit from "./UserInit";
import YT from "../../img/yt-logo.png";

function User({ cache }) {
  // states and functions from the init file
  const {
    user,
    loading,
    games,
    init,
    alertDiscord
  } = UserInit();

  // helper functions
  const { capitalize } = FrontendHelper();

  // code that is executed when the page loads, or when the cache data changes
  useEffect(() => {
    if (cache.games && cache.profiles) {
      init(cache.games, cache.profiles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cache.games, cache.profiles]);

  // user component
  return (
    <div className="user">
      { loading ?
          <p>Loading...</p>
      : 
        <>
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
            <div className="user-image">
              <SimpleAvatar url={ user.avatar_url } size={ 400 } imageReducer={ cache.imageReducer } />
            </div>
            <div className="user-info-socials">
              { user.youtube_url ? 
                <div className="user-info-social">
                  <a href={ user.youtube_url } target="_blank" rel="noopener noreferrer">
                    <img className="social-media-logo" alt="yt-logo" src={ YT }></img>
                  </a>
                </div>                
              : 
                null
              }
              { user.twitch_url ? 
                <div className="user-info-social">
                  <a href={ user.twitch_url } target="_blank" rel="noopener noreferrer">
                    <img className="social-media-logo" alt="twitch-logo" src={ Twitch }></img>
                  </a>
                </div>
              : 
                null
              }
              { user.discord ?
                <div className="user-info-social">
                  <button className="user-discord-button" onClick={ () => alertDiscord(user.discord) }>
                    <img className="social-media-logo" alt="discord-logo" src={ Discord }></img>
                  </button>
                </div>
              :
                null  
              }
            </div>
            <div className="user-about-me">
              <h3>About Me</h3>
              { user.bio ?
                <p>{ user.bio }</p>
              :
                <p><i>This player has no About Me.</i></p>
              }
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
    </div>
  );
};

export default User;