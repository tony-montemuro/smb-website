/* ===== IMPORTS ===== */
import "./User.css";
import { Link } from "react-router-dom";
import { ProfileContext } from "../../utils/Contexts";
import { useContext } from "react";
import BoxArt from "../../components/BoxArt/BoxArt.jsx";
import DiscordLogo from "../../components/DiscordLogo/DiscordLogo.jsx";
import EmbededVideo from "../../components/EmbededVideo/EmbededVideo.jsx";
import RecentSubmissionsTable from "../../components/RecentSubmissionsTable/RecentSubmissionsTable.jsx";
import SocialLink from "../../components/SocialLink/SocialLink.jsx";
import Twitch from "../../img/twitch-logo.png";
import Twitter from "../../img/twitter-logo.png";
import YT from "../../img/yt-logo.png";

function User({ imageReducer }) {
  /* ===== CONTEXTS ===== */

  // profile state from profile context
  const { profile } = useContext(ProfileContext);

  /* ===== VARIABLES ===== */
  const searchParams = new URLSearchParams();
  searchParams.append("profile_id", profile.id);

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
              <DiscordLogo discord={ profile.discord } />
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
      
      { /* If a user has a featured video, render it */ }
      { profile.featured_video &&
        <div className="user-info">
          <h1>Featured Video</h1>
          <div className="user-featured-video">
            <EmbededVideo url={ profile.featured_video } />
          </div>
          { profile.video_description &&
            <p>{ profile.video_description }</p>
          }
        </div>
      }

      { /* Render the user's recent submissions */ }
      <div className="user-info">
        <h1><Link to={ `/recent-submissions?profile_id=${ profile.id }` }>Recent Submissions</Link></h1>
        <RecentSubmissionsTable searchParams={ searchParams } />
      </div>

      { /* If a user moderates at least 1 game, render a link to the game page for each game */ }
      { profile.moderated_games.length > 0 &&
        <div className="user-info">
          <h1>Games Moderated</h1>
          <div className="user-games">
            { profile.moderated_games.map(game => {
              return (
                <div className="user-game">
                  <Link to={ `/games/${ game.abb }` }>
                    { <BoxArt game={ game } imageReducer={ imageReducer } width={ 80 } /> }
                    <span>{ game.name }</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default User;