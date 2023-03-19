/* ===== IMPORTS ===== */
import "./User.css";

function SocialLink({ name, link, logo }) {
  // if a link exists, create a fancy link that allows the user to navigate to that location
  return link ? 
      <div className="user-info-social">
        <a href={ link } target="_blank" rel="noopener noreferrer">
          <img className="social-media-logo" src={ logo } alt={ `${ name }-logo` } />
        </a>
      </div>
    :
      null;
  };
  
/* ===== EXPORTS ===== */
export default SocialLink;