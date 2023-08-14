/* ===== IMPORTS ===== */
import "./User.css";
import { ProfileContext } from "../../utils/Contexts";
import { useContext } from "react";
import Discord from "../../img/discord-logo.png";
import EmbededVideo from "../../components/EmbededVideo/EmbededVideo.jsx";
import SocialLink from "../../components/SocialLink/SocialLink.jsx";
import Twitch from "../../img/twitch-logo.png";
import Twitter from "../../img/twitter-logo.png";
import YT from "../../img/yt-logo.png";
import UserHelper from "../../helper/UserHelper";

function User() {
  /* ===== CONTEXTS ===== */

  // profile state from profile context
  const { profile } = useContext(ProfileContext);

  /* ===== FUNCTIONS ===== */

  // functions from user js file
  const { alertDiscord } = UserHelper();

  /* ===== USER COMPONENT ===== */
  return (
    <div className="user">
      <div className="user-info">

        <h1>User Information</h1>

        { /* Contact - Render the user's social media information. */ }
        <div className="user-info-contact">
          <h2>Socials</h2>

          { /* Render socials if any exist. */ }
          { profile.youtube_handle || profile.twitch_username || profile.twitter_handle || profile.discord ?
            <div className="user-info-socials">
              <SocialLink name="youtube" username={ profile.youtube_handle } logo={ YT } />
              <SocialLink name="twitch" username={ profile.twitch_username } logo={ Twitch } />
              <SocialLink name="twitter" username={ profile.twitter_handle } logo={ Twitter } />

              { /* Discord is not a link, but a button. So, it is handled here. User is not required to have a discord.
              Only render discord information if it exists */ }
              { profile.discord &&
                <div className="user-info-discord">
                  <button type="button" className="user-discord-button" onClick={ () => alertDiscord(profile.discord) }>
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
      
      { profile.featured_video &&
          <div className="user-featured-video">
            <h1>Featured Video</h1>
            <div className="user-featured-video-wrapper">
              <EmbededVideo url={ profile.featured_video } />
            </div>
            { profile.video_description &&
              <p>{ profile.video_description }</p>
            }
          </div>
      }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default User;