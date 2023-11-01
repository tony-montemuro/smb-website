/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";
import styles from "./Levelboard.module.css";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import DetailedRecord from "../../components/DetailedRecord/DetailedRecord";
import DetailedUsername from "../../components/DetailedUsername/DetailedUsername";
import FrontendHelper from "../../helper/FrontendHelper";
import VideocamIcon from "@mui/icons-material/Videocam";

function LevelboardRow({ submission, imageReducer, level, worldRecord, onClickFunc }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { getTimeAgo, recordB2F } = FrontendHelper();

  /* ===== VARIABLES ===== */
  const location = useLocation();
  const type = location.pathname.split("/")[4];
  const worldRecordDiff = recordB2F(worldRecord-submission.record, type, level.timer_type);

  /* ===== LEVELBOARD ROW COMPONENT ===== */
  return (
    <tr className={ styles.chartRow } onClick={ () => onClickFunc(submission) }>
      <td>{ submission.position }</td>
      <td>
        <DetailedUsername imageReducer={ imageReducer } profile={ submission.profile } />
      </td>
      <td>
        <div className={ styles.record }>
          <DetailedRecord submission={ submission } iconSize="medium" timerType={ level.timer_type } />
          <span 
            className={ styles.difference } 
            title={ `${ worldRecordDiff } ${ type === "score" ? "points" : "seconds" } off first place` }
          >
            { submission.position !== 1 && `-${ worldRecordDiff }` }
          </span>
        </div>
      </td>
      <td>{ getTimeAgo(submission.submitted_at) }</td>
      <td>{ submission.monkey.monkey_name }</td>
      <td>{ submission.platform.platform_abb }</td>
      <td>{ submission.region.region_name }</td>
      <td>
        { submission.proof && 
          <div className={ styles.svgWrapper }>
            <VideocamIcon titleAccess="Has proof" sx={{ color: "black" }} />
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
      <td>
        { submission.tas && "TAS" }
      </td>
    </tr>
  );
};

/* ===== EXPORTS ===== */
export default LevelboardRow;