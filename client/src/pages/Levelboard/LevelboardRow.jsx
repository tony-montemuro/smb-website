/* ===== IMPORTS ===== */
import "./Levelboard.css";
import { useContext } from "react";
import { UserContext } from "../../Contexts";
import { Link, useLocation } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import DetailedUsername from "../../components/DetailedUsername/DetailedUsername";

function LevelboardRow({ submission, imageReducer, reportFunc, deleteFunc }) {
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
      <td>{ submission.details.position }</td>

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

      { /* Render an a tag that links to the proof of the submission, if one exists */ }
      <td>{ submission.details.proof && <a href={ submission.details.proof } target="_blank" rel="noopener noreferrer">☑️</a> }</td>

      { /* Render the comment */ }
      <td>{ submission.details.comment }</td>

      { /* Render true if the submission has been approved; false otherwise */ }
      <td>{ submission.approved ? "True" : "False" }</td>

      { /* Report button: when pressed, a report popup will appear, which will allow the user to report the submission. Users can report
      any submission other than their own submission. */ }
      { user &&
        <td>
          <button 
            onClick={ () => reportFunc(submission.profile.id) }
            disabled={ user.profile && user.profile.id === submission.profile.id }
          >
            📝
          </button>
        </td>
      }

      { /* Delete button: a button that allows moderators to delete a submission. This button should only render if the current
      authenticated user is a moderator. */ }
      { user.is_mod && <td><button onClick={ () => deleteFunc(submission.profile.id) }>❌</button></td> }

    </tr>
  );
};

/* ===== EXPORTS ===== */
export default LevelboardRow;