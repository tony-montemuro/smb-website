/* ===== IMPORTS ===== */
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import DetailedUsername from "../../components/DetailedUsername/DetailedUsername";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardRecord from "./LevelboardRecord";
import VideocamIcon from "@mui/icons-material/Videocam";

function LevelboardRow({ submission, imageReducer, onClickFunc }) {
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
        <LevelboardRecord submission={ submission } iconSize={ "medium" } />
      </td>

      { /* Render the submission date */ }
      <td>{ getTimeAgo(submission.details.submitted_at) }</td>

      { /* Render the name of the monkey */ }
      <td>{ submission.details.monkey.monkey_name }</td>

      { /* Render the platform abbreviation */ }
      <td>{ submission.details.platform.platform_abb }</td>

      { /* Render the name of the region */ }
      <td>{ submission.details.region.region_name }</td>

      { /* Render a camera svg tag that links to the proof of the submission, if one exists */ }
      <td>
        { submission.details.proof && 
          <div className="levelboard-svg-wrapper">
            <VideocamIcon titleAccess="Has proof" sx={{ color: "black" }} />
          </div>
        }
      </td>

      { /* Render the comment */ }
      <td>
        { submission.details.comment && 
          <div className="levelboard-svg-wrapper">
            <ChatBubbleRoundedIcon titleAccess={ submission.details.comment } fontSize="small" />
          </div>
        }
      </td>

    </tr>
  );
};

/* ===== EXPORTS ===== */
export default LevelboardRow;