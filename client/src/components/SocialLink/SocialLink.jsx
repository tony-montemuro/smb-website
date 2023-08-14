/* ===== IMPORTS ===== */
import SocialLinkLogic from "./SocialLink.js";

function SocialLink({ name, username, logo }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { getLink } = SocialLinkLogic();

  /* ===== SOCIAL LINK COMPONENT ===== */
  // if a username exists, create a fancy link that allows the user to navigate to that location
  return username && 
    <div className="social-link">
      <a href={ getLink(name, username) } target="_blank" rel="noopener noreferrer">
        <img className="social-media-logo" src={ logo } alt={ `${ name }-logo` } />
      </a>
    </div>
};

/* ===== EXPORTS ===== */
export default SocialLink;