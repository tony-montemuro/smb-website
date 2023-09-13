/* ===== IMPORTS ===== */
import "./UserRow.css";
import DetailedUsername from "../DetailedUsername/DetailedUsername";
import Discord from "../../img/discord-logo.png";
import SocialLink from "../SocialLink/SocialLink.jsx";
import Twitch from "../../img/twitch-logo.png";
import Twitter from "../../img/twitter-logo.png";
import Username from "../Username/Username.jsx";
import UserHelper from "../../helper/UserHelper";
import YT from "../../img/yt-logo.png";

function UserRow({ user, imageReducer = null, isDetailed = false, disableLink = false, onClick = undefined }) {
  /* ===== FUNCTIONS ===== */
  const { alertDiscord } = UserHelper();

  /* ===== USER ROW COMPONENT ===== */
  if (!isDetailed) {
    return (
      // Simply return a row containing the username of the user in question
      <div className={ `users-row${ onClick ? " users-row-hoverable" : "" }` } onClick={ onClick ? () => onClick(user) : null }>
        <Username 
          country={ user.country.iso2 ? user.country.iso2 : user.country } 
          profileId={ user.id } 
          username={ user.username } 
          disableLink={ disableLink } 
        />
      </div>
    );
  } else {
    return (
      <div className={ `users-row${ onClick ? " users-row-hoverable" : "" }` } onClick={ onClick ? () => onClick(user) : null }>

        { /* On the left side of the container, render the user's detailed username */ }
        <DetailedUsername 
          imageReducer={ imageReducer } 
          country={ user.country.iso2 } 
          profileId={ user.id } 
          username={ user.username } 
        />

        { /* On the right side of the container, render the user's social media accounts */ }
        <div className="users-row-socials">
          <SocialLink name="youtube" username={ user.youtube_handle } logo={ YT } />
          <SocialLink name="twitch" username={ user.twitch_username } logo={ Twitch } />
          <SocialLink name="twitter" username={ user.twitter_handle } logo={ Twitter } />

          { /* Discord is not a link, but a button. So, it is handled here. User is not required to have a discord.
          Only render discord information if it exists */ }
          { user.discord &&
            <div className="users-row-discord">
              <button type="button" onClick={ () => alertDiscord(user.discord) }>
                <img className="social-media-logo" alt="discord-logo" src={ Discord }></img>
              </button>
            </div>
          }

        </div>

      </div>
    )
  }
};

/* ===== EXPORTS ===== */
export default UserRow;