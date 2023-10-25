/* ===== IMPORTS ===== */
import styles from "./Administrator.module.css";

function Administrator() {
  /* ===== ADMINISTRATOR COMPONENT ===== */
  return (
    <div className={ styles.administrator }>
      <h1>Administrator</h1>

      { /* About section - general information about administrators */ }
      <h2>About</h2>
      <div className={ styles.body }>
        <p><strong>Administrators</strong> are the highest level of user on SMB Elite. You are able to do everything a game moderator can do, plus some additional actions, including:</p>
        <ul>
          <li>Perform moderation action for <strong>any</strong> game</li>
          <li><strong>Add</strong> and <strong>remove</strong> game moderators</li>
          <li><strong>Create</strong> site-wide posts</li>
        </ul>
        <p>Administrators also have direct contact to other administrators through discord, which you can use to coordinate site-wide actions, such as getting new games added, handling problematic users, etc.</p>
      </div>

      { /* Future of Administrators section - information about how the administrator role will evolve in the future */ }
      <h2>Future of Administrators</h2>
      <div className={ styles.body }>
        <p>In the future, administrators will be given a GUI interface on the website for adding games. This is a feature that is still a work in progress, so please be patient. In the meantime, please ask <strong>TonySMB</strong> for help if you wish to add a new game.</p>
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Administrator;