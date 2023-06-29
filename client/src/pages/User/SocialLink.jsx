/* ===== IMPORTS ===== */
import "./User.css";
import UserLogic from "./User.js";

function SocialLink({ name, username, logo }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { getLink } = UserLogic();

  /* ===== SOCIAL LINK COMPONENT ===== */
  // if a username exists, create a fancy link that allows the user to navigate to that location
  return username && 
    <div className="user-info-social">
      <a href={ getLink(name, username) } target="_blank" rel="noopener noreferrer">
        <img className="social-media-logo" src={ logo } alt={ `${ name }-logo` } />
      </a>
    </div>
  };
  
/* ===== EXPORTS ===== */
export default SocialLink;