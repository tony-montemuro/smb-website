/* ===== IMPORTS ===== */
import styles from "./SocialLink.module.css";
import FrontendHelper from "../../helper/FrontendHelper";
import SocialLinkLogic from "./SocialLink.js";

function SocialLink({ name, username, size }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { handleClick, getLink, getLogo } = SocialLinkLogic();

  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== SOCIAL LINK COMPONENT ===== */
  return username && 
    <div 
      className={ styles.socialLink } 
      onClick={ (e) => handleClick(e) } 
      style= { { width: `${ size }px`, height: `${ size }px` } }
      title={ capitalize(name) }
    >
      <a href={ getLink(name, username) } target="_blank" rel="noopener noreferrer">
        { getLogo(name) }
      </a>
    </div>
};

/* ===== EXPORTS ===== */
export default SocialLink;