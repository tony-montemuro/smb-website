/* ===== IMPORTS ===== */
import styles from "./UserRow.module.css";
import DetailedUsername from "../DetailedUsername/DetailedUsername";
import DiscordLogo from "../DiscordLogo/DiscordLogo.jsx";
import SocialLink from "../SocialLink/SocialLink.jsx";
import Username from "../Username/Username.jsx";

function UserRow({ user, imageReducer = null, isDetailed = false, disableLink = false, onClick }) {
  /* ===== VARIABLES ===== */
  const SOCIAL_SIZE = 40;

  /* ===== USER ROW COMPONENT ===== */

  // If the `isDetailed` flag is set to false, simply render a row containing the `Username` component associated with each user
  if (!isDetailed) {
    return (
      <div
        className={ `${ styles.userRow }${ onClick ? ` ${ styles.hoverable }` : "" }` } 
        onClick={ () => onClick(user) }
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
        onClick={ () => onClick(user) }
      >
        <DetailedUsername imageReducer={ imageReducer } profile={ user } disableLink={ true } />
        <div className={ styles.socials }>
          <SocialLink name="youtube" username={ user.youtube_handle } size={ SOCIAL_SIZE } />
          <SocialLink name="twitch" username={ user.twitch_username } size={ SOCIAL_SIZE } />
          <SocialLink name="twitter" username={ user.twitter_handle } size={ SOCIAL_SIZE } />
          <DiscordLogo discord={ user.discord } size={ SOCIAL_SIZE } />
        </div>
      </div>
    );
  }
};

/* ===== EXPORTS ===== */
export default UserRow;