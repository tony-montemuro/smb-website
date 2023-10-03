/* ===== IMPORTS ===== */
import styles from "./UserRow.module.css";
import DetailedUsername from "../DetailedUsername/DetailedUsername";
import DiscordLogo from "../DiscordLogo/DiscordLogo.jsx";
import SocialLink from "../SocialLink/SocialLink.jsx";
import Twitch from "../../img/twitch-logo.png";
import Twitter from "../../img/twitter-logo.png";
import Username from "../Username/Username.jsx";
import YT from "../../img/yt-logo.png";

function UserRow({ user, imageReducer = null, isDetailed = false, disableLink = false, onClick = undefined }) {
  /* ===== USER ROW COMPONENT ===== */

  // If the `isDetailed` flag is set to false, simply render a row containing the `Username` component associated with each user
  if (!isDetailed) {
    return (
      <div
        className={ `${ styles.userRow }${ onClick ? ` ${ styles.hoverable }` : "" }` } 
        onClick={ onClick ? () => onClick(user) : null }
      >
        <Username profile={ user } disableLink={ disableLink } />
      </div>
    );
  } 
  
  // Otherwise, render the user's full `DetailedUsername`, as well as their social media accounts on the right of the container
  else {
    return (
      <div 
        className={ `${ styles.userRow }${ onClick ? ` ${ styles.hoverable }` : "" }` } 
        onClick={ onClick ? () => onClick(user) : null }
      >
        <DetailedUsername imageReducer={ imageReducer } profile={ user } />
        <div className={ styles.socials }>
          <SocialLink name="youtube" username={ user.youtube_handle } logo={ YT } />
          <SocialLink name="twitch" username={ user.twitch_username } logo={ Twitch } />
          <SocialLink name="twitter" username={ user.twitter_handle } logo={ Twitter } />
          <DiscordLogo discord={ user.discord } />
        </div>
      </div>
    )
  }
};

/* ===== EXPORTS ===== */
export default UserRow;