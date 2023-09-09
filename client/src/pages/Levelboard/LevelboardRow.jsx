/* ===== IMPORTS ===== */
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import DetailedUsername from "../../components/DetailedUsername/DetailedUsername";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardRecord from "./LevelboardRecord";
import VideocamIcon from "@mui/icons-material/Videocam";

function LevelboardRow({ submission, imageReducer, level, onClickFunc }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { getTimeAgo } = FrontendHelper();

  /* ===== LEVELBOARD ROW COMPONENT ===== */
  return (
    <tr onClick={ () => onClickFunc(submission) }>
      { /* Render the position */ }
      <td>{ submission.position }</td>

      { /* Render information about the user */ }
      <td>
        <DetailedUsername
          imageReducer={ imageReducer }
          country={ submission.profile.country }
          profileId={ submission.profile.id }
          username={ submission.profile.username }
        />
      </td>

      { /* Render the record */ }
      <td>
        <LevelboardRecord submission={ submission } iconSize={ "medium" } timerType={ level.timer_type } />
      </td>

      { /* Render the submission date */ }
      <td>{ getTimeAgo(submission.submitted_at) }</td>

      { /* Render the name of the monkey */ }
      <td>{ submission.monkey.monkey_name }</td>

      { /* Render the platform abbreviation */ }
      <td>{ submission.platform.platform_abb }</td>

      { /* Render the name of the region */ }
      <td>{ submission.region.region_name }</td>

      { /* Render a camera svg tag that links to the proof of the submission, if one exists */ }
      <td>
        { submission.proof && 
          <div className="levelboard-svg-wrapper">
            <VideocamIcon titleAccess="Has proof" sx={{ color: "black" }} />
          </div>
        }
      </td>

      { /* Render a comment svg tag that, when hovered, displays the comment, if one exists */ }
      <td>
        { submission.comment && 
          <div className="levelboard-svg-wrapper">
            <ChatBubbleRoundedIcon titleAccess={ submission.comment } fontSize="small" />
          </div>
        }
      </td>

      { /* Render the phrase "TAS", if the submission's tas property is `true` */ }
      <td>
        { submission.tas && "TAS" }
      </td>

    </tr>
  );
};

/* ===== EXPORTS ===== */
export default LevelboardRow;