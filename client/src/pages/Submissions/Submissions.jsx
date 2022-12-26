import "./submissions.css";
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import SubmissionInit from "./SubmissionsInit";
import FrontendHelper from "../../helper/FrontendHelper";

function Submissions({ isMod }) {
  const { 
    loading, 
    gameList, 
    scoreRecords,
    timeRecords,
    submissions, 
    currentGame, 
    checkForMod, 
    queryGames,
    querySubmissions,
    mergeRecords,
    changeGame, 
    approveSubmission
   } = SubmissionInit();

  // code that is executed when the page is loaded
  useEffect(() => {
    if (isMod !== null) {
      checkForMod(isMod);
      queryGames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMod]);

  // code that is executed once it is verified that the user is a moderator, and the game list is loaded
  useEffect(() => {
    if (isMod && gameList.length > 0) {
      querySubmissions("score");
      querySubmissions("time");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMod, gameList]);

  // code that is executed once both the time and score submissions have both been loaded
  useEffect(() => {
    // once submissions has a property for each game, this means that our querying has completed
    // and we can proceed
    if (scoreRecords.loaded && timeRecords.loaded) {
      mergeRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoreRecords, timeRecords]);

  // Helper functions
  const { cleanLevelName } = FrontendHelper();

  return (
    <div className="submissions">
      {isMod ? 
      <div className="submissions-header">
        <h1>Recent Submissions</h1>
        <p><i>Below is the list of recent submissions. Please go through and review each submission for each game.</i></p>
        <p>If a submission is <b>valid</b>, just click the <b>Reviewed</b> button for that submission.</p>
        <p>If you suspect a submission is <b>invalid</b>, first navigate to the board with the invalid
        submission by clicking on the <b>Level Name</b>. If you still are suspicious, remove the record
        by clicking the <b>Delete</b> button. Finally, navigate back to the <b>Recent Submissions</b> page, and
        click the <b>Reviewed</b> button for that submission.</p>
      </div> 
      : 
      ""}
      {loading ?
        <p>Loading...</p>
        :
        <div className="submissions-body">
          <div className="selector">
            <form>
              <select
                onChange={(e) => changeGame(e.target.value)}
                value={currentGame}
              >
                {gameList.map(val => {
                  return <option key={val.abb} value={val.abb}>{val.name}</option>
                })}
              </select>
            </form>
          </div>
          <div className="submissions-list">
            <table>
              <thead>
                <tr>
                  <th>Submission Date</th>
                  <th>Level Name</th>
                  <th>Mode</th>
                  <th>User</th>
                  <th>Record</th>
                  <th>Live Status</th>
                  <th>Proof</th>
                  <th>Comment</th>
                  <th>Approve</th>
                </tr>
              </thead>
              <tbody>
              { submissions[currentGame].map(val => {
                return <tr key={ val.submitted_at }>
                  <td>{ val.submitted_at }</td>
                  <td>
                    <Link to={`/games/${ currentGame }/${ val.level.misc ? "misc" : "main" }/${ val.is_score ? "score" : "time" }/${ val.level.name }`}>
                      { cleanLevelName(val.level.name) }
                    </Link>
                  </td>
                  <td>{ val.is_score ? "Score" : "Time" }</td>
                  <td>
                    <div className="submissions-user-info">
                    {val.profiles.country ?
                      <div><span className={ `fi fi-${val.profiles.country.toLowerCase()}` }></span></div>
                      :
                      ""
                    }
                    <div><Link to={ `/user/${ val.profiles.id }` }>{ val.profiles.username }</Link></div>
                    </div>
                  </td>
                  <td>{ val.record }</td>
                  { val.live ? <td>Live</td> : <td>Non-live</td> }
                  <td>{ val.proof !== "none" ? <a href={val.proof} target="_blank" rel="noopener noreferrer">☑️</a> : '' }</td>
                  <td>{ val.comment }</td>
                  <td><button onClick={ () => approveSubmission(val) }>Approve</button></td>
                </tr>
              })}
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  );
}

export default Submissions;