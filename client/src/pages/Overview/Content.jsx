/* ===== IMPORTS ===== */
import styles from "./Overview.module.css";
import BoxArt from "../../components/BoxArt/BoxArt.jsx";

/* ===== COMPONENTS ===== */

// COMPONENT 1: General component - the content of the general container
export function General() {
  return (
    <>
      This page contains general information relevant to the main Super Monkey Ball games: 
      <ul>
          <li>Super Monkey Ball (SMB1)</li>
          <li>Super Monkey Ball 2 (SMB2)</li>
          <li>Super Monkey Ball Deluxe (SMBDX)</li>
      </ul>
      For information regarding custom level packs or another entry in the series, please refer to the game-specific rules page.
    </>
  );
};

// COMPONENT 2: Types component - the content of the types container
export function Types() {
  return (
    <>
      Genearlly, there are two types of competition in Super Monkey Ball games: <b>time</b> and <b>score</b>, with the straightforward objectives of achieving the fastest time or highest score respectively.<br /><br />
      For time submissions, please submit the time remaining on the timer when you finish your run; do <b>not</b> calculate and submit the actual time taken. For example, if you finish at 58.33, submit 58.33, <b>not</b> 1.67. Time charts are displayed in descending order, so the higher your time, the better.<br /><br />
      For score submissions, simply submit the final score displayed after you finish your run.
    </>
  );
};

// COMPONENT 3: Score calculation component - the content of the score calculation container
export function ScoreCalculation() {
  return (
    <>
      Score on individual levels (ILs) in Super Monkey Ball is calculated based on three variables:
      <ol>
        <li>Clear Score</li>
        <li>Time Bonus</li>
        <li>Bananas</li>
      </ol>
      The <b>clear score</b> is determined by the time remaining when you finish the floor, multiplied by 100. For example, finishing a floor with 58.33 remaining will add 5,833 points to the clear score. Failing to complete a floor either by fall out or time over will result in a clear score of 0.<br /><br />
      On floors with warp goals, an additional 10,000 or 20,000 points will be added to the <b>clear score</b> if you finish in a green or red goal respectively. If you pass through a warp goal after already finishing in a goal, no further points will be added to your clear score.<br /><br />
      The time bonus is awarded if you complete the floor with <b>over</b> half the given time remaining, and applies a x2 multiplier to the <b>clear score</b>, referring to the result as the <b>floor score</b> in SMB1, and <b>stage score</b> in SMB2 and SMBDX. The floor / stage score will remain the same as the clear score should you finish without the time bonus.<br /><br />
      Collecting bananas placed on floors during the attempt results in points being added directly to your <b>total score</b>. Each single banana is worth 100 points, and each bunch is worth 10 single bananas, or 1,000 points. Any bananas collected after already finishing in the goal (often referred to as post-goal bananas) will still add points to the total score as normal. As points from bananas are added directly to your total score, they will <b>not</b> be affected by the time bonus multiplier.<br /><br />
      A general rule of thumb to determine if bananas are worth collecting is:
      <ul>
        <li>Points from collecting 1 banana = Points from saving 1s = Points from saving 0.5s with time bonus</li>
        <li>Points from collecting 1 bunch = Points from saving 10s = Points from saving 5s with time bonus</li>
      </ul>
      The <b>final score</b> for the attempt is then calculated by summing the <b>floor / stage score</b> and <b>total score</b>.<br /><br />
      In SMB1, <b>bonus floors</b> are an exception to this calculation, as these floors do not contain goals (with the exception of Expert 40), making it impossible to achieve a clear score. In these cases, the score calculation is solely determined by the number of bananas collected in the given time. This includes Expert 40, which still has no clear score despite containing a goal.<br /><br />
      In SMBDX, bonus floors that do not contain a goal calculate score in the same fashion as bonus floors in SMB1. Any bonus floor that contains a goal (including E20 Bonus Hunting) calculates score as normal.<br /><br />
      <i>Note that IL score calculation is slightly different outside of Practice Mode. Please see “Replay Errors” for more details.</i>
    </>
  );
};

// COMPONENT 4: Pausing rule component - the content of the pausing rule container
export function PausingRule() {
  return (
    <>
      Pausing the game at any point during the “live” part of an attempt is considered cheating and will immediately invalidate any time or score, as pausing can easily be abused to gain a competitive advantage, rendering competition trivial. The “live” part of an attempt is specifically from when the player first gains control of the monkey (i.e. the frame the timer displays 59.98 or 29.98) up until, but not including, the first frame the goal tape is broken, or rather, the second frame the timer displays the finish time for that attempt.
    </>
  );
};

// COMPONENT 5: Proof requirement component - the content of the proof requirement container
export function ProofRequirements() {
  return (
    <>
      For a run to be officially recognised and counted toward your total score, you <b>must</b> provide a <b>liveplay</b> of your run, this being a video of the run being performed in Practice Mode. Providing only an in-game replay is <b>not sufficient</b> evidence to prove a submission. If you are unable to provide a liveplay, replay-only scores may still be submitted, however the submission will <b>not</b> be officially recognised nor count toward your total score, and must be specified when submitting your run.<br /><br />
      Liveplays must be of at least reasonable video quality in order to be verified, and runs may be rejected if the video quality is too poor. Please use common sense to judge what constitutes “reasonable video quality”. Game audio is not required, but strongly preferred for liveplay submissions.
    </>
  );
};

// COMPONENT 6: Regions component - the content of the regions container
export function Regions({ imageReducer }) {
  const smb2Games = [{ abb: "smb2", name: "Super Monkey Ball 2" }, { abb: "smb2pal", name: "Super Monkey Ball 2 PAL" }];
  return (
    <>
      NTSC and PAL are terms used to distinguish between different regional releases of Super Monkey Ball, with NTSC being further split into NTSC-J and NTSC-U. Typically, NTSC-J is considered the Japanese version, NTSC-U the North American version, and PAL the European version. As such, the version you own will most likely depend on where in the world you live. If you are unsure which version you own, you can easily check by looking at the box art. Take SMB2 as an example:<br /><br />
      <div className={ styles.boxartContainer }>
        { smb2Games.map(game => {
          return (
            <div className={ styles.boxart } key={ game.abb }>
              <BoxArt game={ game } imageReducer={ imageReducer } width={ 200 } />
              <span>{ game.name }</span>
            </div>
          );
        })}
      </div>
      With the exception of SMB2, the version you use will have no effect on times or scores and are all recorded on the same charts, however the version used should still be specified when submitting. That said, if you own the PAL version of either game, you should ensure you play in <b>60Hz mode</b> to be able to compete fairly, as 50Hz mode runs the game slower, making it much harder to compete. Moreover, score calculation in 50Hz mode is broken in SMB1, always resulting in significantly lower scores than at 60Hz.<br /><br />
      If you are unsure which mode you are playing in, you can tell by checking the decimal values of the in-game timer. In 50Hz mode, the timer displays .X0, .X2, .X4, .X6, and .X8, whereas in 60Hz mode, the timer displays .X0, .X1, .X3, .X5, .X6, and .X8. To play in 60Hz mode, make sure your console is set to 60Hz in the system settings.<br /><br />
      As for SMB2, the NTSC and PAL versions have slightly different physics, with faster times and higher scores being achievable on the PAL version. Consequently, times and scores cannot be fairly compared and are recorded on separate charts. Please ensure you are aware which version of SMB2 you are playing on and submit your runs to the correct charts.
    </>
  );
};

// COMPONENT 7: Replay errors component - the content of the replay errors container
export function ReplayErrors() {
  return (
    <>
      A common mistake new players make is submitting incorrect times based off of the replay info rather than the actual time in Practice Mode. This is due to an in-game error where times ending in .X1 or .X6 will display incorrectly as .X2 and .X7 respectively in the replay. If this happens, please make sure to submit the time you finished in Practice Mode, not the time displayed in the replay.<br /><br />
      Another error with the replay info will occur when saving a replay from Normal / Challenge Mode that finishes in a warp goal. Outside of Practice Mode, warp goals give an additional warp bonus that multiplies the clear score by x2 or x3 depending on the colour of the goal, making much higher scores achievable than what is possible in Practice Mode. Replays from Normal / Challenge Mode will display the score <b>including</b> the warp bonus, and these scores should <b>not</b> be submitted to Practice Mode charts. If you wish to submit an IL score performed in Normal / Challenge Mode, you must first re-calculate it to negate the warp bonus beforehand.
    </>
  );
};

// COMPONENT 8: Emulators component - the content of the emulators container
export function Emulators() {
  return (
    <>
      Currently, runs performed on Dolphin emulator are allowed to be submitted to SMB1 and SMB2 charts, however they must be marked as such. Despite this, playing on console is much preferred and encouraged. For SMBDX, emulator runs are strictly <b>not allowed</b> and may not be submitted to any ranked charts.
    </>
  );
};