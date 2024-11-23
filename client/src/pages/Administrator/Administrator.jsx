/* ===== IMPORTS ===== */
import { useEffect } from "react";
import styles from "./Administrator.module.css";
import ScrollHelper from "../../helper/ScrollHelper";

function Administrator() {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { scrollToTop } = ScrollHelper();

  /* ===== EFFECTS ===== */

  // code that executes when the component mounts
  useEffect(() => {
    scrollToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== ADMINISTRATOR COMPONENT ===== */
  return (
    <div className={ styles.administrator }>
      <h1>Administration</h1>

      { /* About section - general information about administrators */ }
      <h2>About</h2>
      <div className={ styles.body }>
        <p><strong>Administrators</strong> are the highest level of user on SMB Elite. You are able to do everything a game moderator can do, plus some additional actions, including:</p>
        <ul>
          <li>Perform moderation action for <strong>any</strong> game</li>
          <li><strong>Add new games</strong> to the website</li>
          <li><strong>Add</strong> and <strong>remove</strong> game moderators</li>
          <li><strong>Add versions</strong> to games with multiple versions</li>
          <li><strong>Create</strong> site-wide posts</li>
        </ul>
        <p>Administrators also have direct contact to other administrators through Discord, which you can use to coordinate site-wide actions, such as getting new games added, handling problematic users, etc.</p>
      </div>

      { /* Future of Administrators section - information about how the administrator role will evolve in the future */ }
      <h2>Future of Administrators</h2>
      <div className={ styles.body }>
        <p>In the future, administrators will be given a GUI interface on the website for <strong>updating information about any game</strong>. Currently, it is only possible to create new games. This is a feature that is currently a work in progress, so please be patient.
        In the meantime, please ask <strong>TonySMB</strong> for help if you wish to make an update to a game.</p>
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Administrator;