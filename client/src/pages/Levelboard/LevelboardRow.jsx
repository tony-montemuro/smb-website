/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";
import styles from "./Levelboard.module.css";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import DetailedRecord from "../../components/DetailedRecord/DetailedRecord";
import DetailedUsername from "../../components/DetailedUsername/DetailedUsername";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper.js";
import LiveIcon from "../../assets/svg/Icons/LiveIcon.jsx";
import Medal from "./Medal.jsx";
import VideocamIcon from "@mui/icons-material/Videocam";

function LevelboardRow({ submission, imageReducer, level, worldRecord, onClickFunc }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { getTimeAgo, recordB2F } = FrontendHelper();
  const { isPracticeMode } = GameHelper();

  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const category = path[3];
  const type = path[4];
  const worldRecordDiff = recordB2F(worldRecord-submission.record, type, level.timer_type);

  /* ===== LEVELBOARD ROW COMPONENT ===== */
  return (
    <tr className={ styles.chartRow } onClick={ () => onClickFunc(submission) }>

      { /* If chart is practice mode, render applicable medal */ }
      { isPracticeMode(category) && <td><Medal medal={ submission.medal } /></td> }

      <td>{ submission.position }</td>
      <td>
        <DetailedUsername imageReducer={ imageReducer } profile={ submission.profile } />
      </td>
      <td>
        <div className={ styles.record }>
          <DetailedRecord submission={ submission } iconSize="medium" timerType={ level.timer_type } />
            { submission.position !== 1 &&
              <span 
                className={ styles.difference } 
                title={ `${ worldRecordDiff } ${ type === "score" ? "points" : "seconds" } off first place` }
              >
                -{ worldRecordDiff } 
              </span> 
            }
        </div>
      </td>
      <td>{ getTimeAgo(submission.submitted_at) }</td>
      <td>{ submission.monkey.monkey_name }</td>
      <td title={ submission.platform.platform_name }>{ submission.platform.platform_abb }</td>
      <td>{ submission.region.region_name }</td>
      <td>
        { submission.proof && 
          <div className={ styles.svgWrapper }>
            { submission.live ? <LiveIcon /> : <VideocamIcon titleAccess="Has proof" /> }
          </div>
        }
      </td>
      <td>
        { submission.comment && 
          <div className={ styles.svgWrapper }>
            <ChatBubbleRoundedIcon titleAccess={ submission.comment } fontSize="small" />
          </div>
        }
      </td>
      <td title="Tool-assisted speedrun">
        { submission.tas && "TAS" }
      </td>
    </tr>
  );
};

/* ===== EXPORTS ===== */
export default LevelboardRow;