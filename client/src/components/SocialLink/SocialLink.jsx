/* ===== IMPORTS ===== */
import styles from "./SocialLink.module.css";
import FrontendHelper from "../../helper/FrontendHelper";
import SocialLinkLogic from "./SocialLink.js";
import Twitch from "../../assets/svg/Twitch.jsx";
import X from "../../assets/svg/X.jsx";
import Youtube from "../../assets/svg/Youtube.jsx";

function SocialLink({ name, username, size }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { handleClick, getLink } = SocialLinkLogic();

  // helper functions
  const { capitalize } = FrontendHelper();


  // FUNCTION 1: getLogo - function that takes a social media name, and returns the code for it's logo
  // PRECONDITIONS (1 parameter):
  // 1.) name: a string representing the name of a social media platform; should be one of the following strings:
  // "youtube", "twitch", "twitter"
  // POSTCONDTIONS (1 possible outcome):
  // the appropriate logo is returned
  const getLogo = name => {
    switch (name) {
      case "youtube":
        return <Youtube />;
      case "twitch":
        return <Twitch />;
      case "twitter":
        return <X />;
      default:
        return null;
    };
  };

  /* ===== SOCIAL LINK COMPONENT ===== */
  return username &&
    <div
      className={ styles.socialLink }
      onClick={ (e) => handleClick(e) }
      style={ { width: `${size}px`, height: `${size}px` } }
      title={ capitalize(name) }
    >
      <a href={ getLink(name, username) } target="_blank" rel="noopener noreferrer">
        { getLogo(name) }
      </a>
    </div>
};

/* ===== EXPORTS ===== */
export default SocialLink;
