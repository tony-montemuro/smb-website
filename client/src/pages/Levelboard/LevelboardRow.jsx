/* ===== IMPORTS ===== */
import { useContext } from "react";
import { UserContext } from "../../Contexts";
import { Link, useLocation } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import DetailedUsername from "../../components/DetailedUsername/DetailedUsername";
import FrontendHelper from "../../helper/FrontendHelper";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import VideocamIcon from "@mui/icons-material/Videocam";

function LevelboardRow({ submission, imageReducer, reportFunc, updateFunc, deleteFunc }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
	const type = location.pathname.split("/")[4];

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { recordB2F, dateB2F } = FrontendHelper();

  /* ===== LEVELBOARD ROW COMPONENT ===== */
  return (
    <tr>
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
      <td><Link to={ `${submission.profile.id}` }>{ recordB2F(submission.details.record, type) }</Link></td>

      { /* Render the submission date */ }
      <td>{ dateB2F(submission.details.submitted_at) }</td>

      { /* Render the name of the region */ }
      <td>{ submission.details.region.region_name }</td>

      { /* Render the name of the monkey */ }
      <td>{ submission.details.monkey.monkey_name }</td>

      { /* Render a camera svg tag that links to the proof of the submission, if one exists */ }
      <td>
        { submission.details.proof && 
          <div className="levelboard-svg-wrapper">
            <a href={ submission.details.proof } target="_blank" rel="noopener noreferrer">
              <VideocamIcon sx={{ color: "black" }} />
            </a>
          </div>
        }
      </td>

      { /* Render the comment */ }
      <td>{ submission.details.comment }</td>

      { /* Render checkmark if the submission has been approved */ }
      <td>
        { submission.approved && 
          <div className="levelboard-svg-wrapper">
            <CheckIcon />
          </div>
        }
      </td>

      { /* Report button: when pressed, a report popup will appear, which will allow the user to report the submission. Users can report
      any submission other than their own submission. */ }
      { user.id &&
        <td>
          <div className="levelboard-svg-wrapper">
            <button 
              type="button"
              onClick={ () => reportFunc(submission) }
              disabled={ user.profile && user.profile.id === submission.profile.id }
            >
              <WarningAmberRoundedIcon titleAccess="Report Submission" />
            </button>
          </div>
        </td>
      }

      { /* Moderator exclusive buttons */ }
      { user && user.is_mod &&
        <>
          { /* Update button: a button that allows moderators to update a submission. This butotn should only render if the current
          authenticated user is a moderator */ }
          <td>
            <div className="levelboard-svg-wrapper">
              <button type="button" onClick={ () => updateFunc(submission) }><CreateRoundedIcon titleAccess="Update Submission" /></button>
            </div>
          </td>

          { /* Delete button: a button that allows moderators to delete a submission. This button should only render if the current
          authenticated user is a moderator. */ }
          <td>
            <div className="levelboard-svg-wrapper">
              <button type="button" onClick={ () => deleteFunc(submission) }><ClearRoundedIcon /></button>
            </div>
          </td>
        </>
      }

    </tr>
  );
};

/* ===== EXPORTS ===== */
export default LevelboardRow;