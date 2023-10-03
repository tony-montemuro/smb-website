/* ===== IMPORTS ===== */
import styles from "./DiscordLogo.module.css";
import Discord from "../../img/Discord.jsx";
import DiscordLogoLogic from "./DiscordLogo.js";

function DiscordLogo({ discord, size }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { handleClick, alertDiscord } = DiscordLogoLogic();

  /* ===== DISCORD COMPONENT ===== */
  return discord &&
    <div className={ `${ styles.discord } center` } onClick={ (e) => handleClick(e) } style={ { width: `${ size }px`, height: `${ size }px` } }>
      <button type="button" onClick={ () => alertDiscord(discord) } title="Discord">
        <Discord />
      </button>
    </div>;
};

/* ===== EXPORTS ===== */
export default DiscordLogo;