/* ===== IMPORTS ===== */
import styles from "./DiscordLogo.module.css";
import Discord from "../../img/discord-logo.png";
import DiscordLogoLogic from "./DiscordLogo.js";

function DiscordLogo({ discord }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { alertDiscord } = DiscordLogoLogic();

  /* ===== DISCORD COMPONENT ===== */
  return discord &&
    <div className={ styles.discord }>
      <button type="button" onClick={ () => alertDiscord(discord) }>
        <img className={ styles.logo } alt="discord-logo" src={ Discord }></img>
      </button>
    </div>;
};

/* ===== EXPORTS ===== */
export default DiscordLogo;