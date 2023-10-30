/* ===== IMPORTS ===== */
import { useEffect } from "react";
import styles from "./Moderator.module.css";
import ScrollHelper from "../../helper/ScrollHelper";

function Moderator() {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { scrollToTop } = ScrollHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    scrollToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== MODERATOR COMPONENT ===== */
  return (
    <div className={ styles.moderator }>
      <h1>Moderator</h1>

      { /* About section - general information about moderators */ }
      <h2>About</h2>
      <div className={ styles.body }>
        <p><strong>Moderators</strong> are SMB Elite users with special permissions. You are responsible for keeping the boards accurate for the particular games you moderate. Moderators are able to:</p>
        <ol>
          <li><strong>Approve submissions -</strong> Approving a submission signals to all users that the submission is accurate.</li>
          <li><strong>Update submission details -</strong> If you notice a detail regarding a submission is wrong, you are able to update it before approving the submission.</li>
          <li><strong>Delete submissions -</strong> If a submission is totally invalid, you have the power to remove it.</li>
          <li><strong>Submit on behalf of any user -</strong> For users who are inactive on the website, you can always submit on their behalf to keep the boards up-to-date. <em>Note:</em> Unlike the other 3 actions, this action is performed outside the Moderator Hub, and instead on a level chart page.</li>
        </ol>
      </div>

      { /* Limits section - discusses the limitations of moderators powers */ }
      <h2>Limitations</h2>
      <div className={ styles.body }>
        <p>As a moderator, there are limitations put in place to prevent powers from being abused. These include:</p>
        <ul>
          <li>
            Moderators are only able to <strong>approve</strong>, <strong>update details</strong>, and <strong>delete</strong> unapproved submissions. These include:
            <ol>
              <li>New submissions</li>
              <li>Reported submission</li>
            </ol>
            Thus, if a submission has been approved, a moderator is unable to <strong>update details</strong> or <strong>delete</strong> the submission. You can think of an approval as a way to "protect" a submission from being easily tampered with by other moderators.
          </li>
          <li>
            A clever moderator might think: <em>Why can't I just report a submission to get access to the actions I want?</em> This will not work as they plan, because <strong>moderators are unable to perform actions on reported submissions that:</strong>
            <ol>
              <li>Belong to the moderator</li>
              <li>Were reported by the moderator</li>
            </ol>
            This safety measure ensures that when a moderator reports a submission, it essentially must be seen by at least <em>two</em> moderators (the moderator who created the report, and a second moderator who has permission to perform actions) before an action can be taken.
          </li>
        </ul>
      </div>

      { /* Administrator section - briefly discuss the higher-level administrator role */ }
      <h2>Administrators</h2>
      <div className={ styles.body }>
        <strong>Administrators</strong> are the highest level of user on SMB Elite. They are able to perform moderator actions for all games, as well as some additional privileges. Build enough trust as a moderator, and you may qualify to become an administrator!
      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default Moderator;