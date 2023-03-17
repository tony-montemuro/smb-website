/* ===== IMPORTS ===== */
import "./User.css";
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { Link } from "react-router-dom";
import { StaticCacheContext } from "../../Contexts";
import { useContext, useEffect } from "react";
import Discord from "../../img/discord-logo.png";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";
import SocialLink from "./SocialLink";
import Twitch from "../../img/twitch-logo.png";
import UserLogic from "./User.js";
import YT from "../../img/yt-logo.png";

function User({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const userId = window.location.pathname.split("/")[2];

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES AND FUNCTIONS ===== */

  // states and functions from the init file
  const { user, fetchUser, alertDiscord } = UserLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, or when the staticCache object is updated
  useEffect(() => {
    if (staticCache.profiles.length > 0) {
      fetchUser(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache]);

  /* ===== USER COMPONENT ===== */
  return (
    // If the user data has been loaded, we can render the user's information to the client. Otherwise, 
    // render a loading component.
    <div className="user">
      { user ?
        <>
          { /* LEFT COMPONENT - user info. Render username, country, avatar, social media links, and bio. */ }
          <div className="user-info">
            <h2>{ user.username }</h2>

            { /* A user is not required to have a country. This ternary will handle that case. */ }
            { user.country ? 
              <div className="user-country-name">
                <span className={ `fi fi-${ user.country.iso2.toLowerCase() }` }></span>
                <p>{ user.country.name }</p>
              </div>
            :
              null
            }

            { /* Image will be handled by the SimpleAvatar component. */ }
            <div className="user-image">
              <SimpleAvatar url={ user.avatar_url } size={ 400 } imageReducer={ imageReducer } />
            </div>

            { /* Socials - Render the user's social media information. */ }
            <div className="user-info-socials">
              <SocialLink name="youtube" link={ user.youtube_url } logo={ YT } />
              <SocialLink name="twitch" link={ user.twitch_url } logo={ Twitch } />

              { /* Discord is not a link, but a button. So, it is handled here. User is not required to have a discord,
              so a ternary operator will handle that. */ }
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

            { /* Bio - Render the user's About Me. */ }
            <div className="user-about-me">
              <h3>About Me</h3>

              { /* A user is not required to have a bio. This ternary will handle that case. */ }
              { user.bio ?
                <p>{ user.bio }</p>
              :
                <p><i>This player has no About Me.</i></p>
              }
            </div>

          </div>

          { /* RIGHT COMPONENT - user stats directory. For each game and type, render a link to the users stats page. */ }
          <div className="user-stats-games">
            <h1>View Player Stats</h1>

            { /* Render two separate stat select menus: one for main games, and one for custom games. */ }
            { ["Main", "Custom"].map(type => {
              return (
                <table key={ type }>

                  { /* Table header will simply specify the type of games. */ }
                  <thead>
                    <tr>
                      <th colSpan={ 3 }>{ type } Games</th>
                    </tr>
                  </thead>

                  { /* Table body will render a dynamic number of rows, depending on the number of { type } games. */ }
                  <tbody>
                    { staticCache.games.filter(game => type === "Custom" ? game.custom : !game.custom).map(game => {
                      return (
                        // Each row contains: the name of the game, a link to main stats, and a link to misc stats
                        <tr key={ game.name }>
                          <td>{ game.name }</td>
                          <td><Link className="user-stats-link" to={ `${ game.abb }/main` }>Main</Link></td>
                          <td><Link className="user-stats-link" to={ `${ game.abb }/misc` }>Misc</Link></td>
                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              );
            })}
          </div> 
        </>
      :
        // Loading Component
        <p>Loading...</p>
      }
    </div>
  );
};

export default User;