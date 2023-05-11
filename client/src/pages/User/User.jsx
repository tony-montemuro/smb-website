/* ===== IMPORTS ===== */
import "./User.css";
import { ProfileContext } from "../../Contexts";
import { useContext } from "react";
import Discord from "../../img/discord-logo.png";
import SocialLink from "./SocialLink";
import Twitch from "../../img/twitch-logo.png";
import UserLogic from "./User.js";
import YouTube from "react-youtube";
import YT from "../../img/yt-logo.png";

function User() {
  /* ===== CONTEXTS ===== */

  // profile state from profile context
  const { profile } = useContext(ProfileContext);

  /* ===== FUNCTIONS ===== */

  // functions from user js file
  const { alertDiscord, getVideoId } = UserLogic();

  /* ===== USER COMPONENT ===== */
  return (
    <div className="user">
      <div className="user-info">

        <h1>User Information</h1>

        { /* Contact - Render the user's social media information. */ }
        <div className="user-info-contact">
          <h2>Socials</h2>

          { /* Render socials if any exist. */ }
          { profile.youtube_url || profile.twitch_url || profile.discord ?
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
          :

          // Otherwise, render a message telling the client that the user has no socials.
            <div className="user-missing">
              <p><i>This user has no socials.</i></p>
            </div>
          }

        </div>

        { /* Details - Render the user's details. */ }
        <h2>Details</h2>

        { /* Render details if any exist. */ }
        { profile.bio || profile.birthday ?
          <div className="user-about-me">
            { /* A user is not required to have a bio. Only render bio if it exists. */ }
            { profile.bio &&
              <p><b>About Me:</b> { profile.bio }</p>
            }
  
            { /* A user is not required to have a birthday. Only render birthday if it exists. */ }
            { profile.birthday &&
              <p><b>Birthday:</b> { profile.birthday }</p>
            }

          </div>
        :
          // Otherwise, render a message telling the client that the user has no details.
          <div className="user-missing">
            <p><i>This user has no details.</i></p>
          </div>
        }

      </div>
      
      {
        profile.featured_video &&
          <div className="user-featured-video">
            <h1>Featured Video</h1>
            <YouTube videoId={ getVideoId(profile.featured_video) } />
          </div>
      }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default User;