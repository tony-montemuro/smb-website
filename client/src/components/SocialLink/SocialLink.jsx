/* ===== IMPORTS ===== */
import styles from "./SocialLink.module.css";
import SocialLinkLogic from "./SocialLink.js";

function SocialLink({ name, username, logo }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { handleClick, getLink } = SocialLinkLogic();

  /* ===== SOCIAL LINK COMPONENT ===== */
  return username && 
    <div onClick={ (e) => handleClick(e) }>
      <a href={ getLink(name, username) } target="_blank" rel="noopener noreferrer">
        <img className={ styles.logo } src={ logo } alt={ `${ name }-logo` } />
      </a>
    </div>
};

/* ===== EXPORTS ===== */
export default SocialLink;