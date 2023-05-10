/* ===== IMPORTS ===== */
import "./User.css";
import { ProfileContext } from "../../Contexts";
import { useContext } from "react";
import Discord from "../../img/discord-logo.png";
import Avatar from "../../components/Avatar/Avatar.jsx";
import SocialLink from "./SocialLink";
import Twitch from "../../img/twitch-logo.png";
import UserLogic from "./User.js";
import YT from "../../img/yt-logo.png";

function User({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const IMG_SIZE = 400;

  /* ===== CONTEXTS ===== */

  // profile state from profile context
  const { profile } = useContext(ProfileContext);

  /* ===== FUNCTIONS ===== */

  // functions from user js file
  const { alertDiscord } = UserLogic();

  /* ===== USER COMPONENT ===== */
  return (
    <div className="user">
      <div className="user-info">
        { /* Render username */ }
        <h2>{ profile.username }</h2>

        { /* A user is not required to have a country. Only render country information if it exists */ }
        { profile.country &&
          <div className="user-country-name">
            <span className={ `fi fi-${ profile.country.iso2.toLowerCase() }` }></span>
            <p>{ profile.country.name }</p>
          </div>
        }

        { /* Image will be handled by the Avatar component. */ }
        <div>
          <Avatar url={ profile.avatar_url } size={ IMG_SIZE } imageReducer={ imageReducer } />
        </div>

        { /* Socials - Render the user's social media information. */ }
        <div className="user-info-socials">
          <SocialLink name="youtube" link={ profile.youtube_url } logo={ YT } />
          <SocialLink name="twitch" link={ profile.twitch_url } logo={ Twitch } />

          { /* Discord is not a link, but a button. So, it is handled here. User is not required to have a discord.
          Only render discord information if it exists */ }
          { profile.discord &&
            <div className="user-info-social">
              <button className="user-discord-button" onClick={ () => alertDiscord(profile.discord) }>
                <img className="social-media-logo" alt="discord-logo" src={ Discord }></img>
              </button>
            </div>
          }
        </div>

        { /* Bio - Render the user's About Me. */ }
        <div className="user-about-me">
          <h3>About Me</h3>

          { /* A user is not required to have a bio. Only render bio if it exists. */ }
          { profile.bio &&
            <p>{ profile.bio }</p>
          }

        </div>

      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default User;