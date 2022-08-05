import "./submissions.css";
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import SubmissionInit from "./SubmissionsInit";

function Submissions() {
  const { isMod, loading, gameList, submissions, currentGame, setLoading, checkForMod, changeGame, removeSubmission } = SubmissionInit();

  useEffect(() => {
    checkForMod();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // once submissions has a property for each game, this means that our querying has completed
    // and we can proceed
    if (gameList.length > 0 && Object.keys(submissions).length === gameList.length) {
        setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions]);

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
                  <th>Submission Time</th>
                  <th>Level Name</th>
                  <th>User</th>
                  <th>Record</th>
                  <th>Live Status</th>
                  <th>Proof</th>
                  <th>Comment</th>
                  <th>Reviewed</th>
                </tr>
              </thead>
              <tbody>
              {submissions[currentGame].map(val => {
                return <tr key={val.created_at}>
                  <td>{val.created_at}</td>
                  <td>
                    <Link to={`/games/${val.isMisc ? currentGame+"misc" : currentGame}/${val.isScore ? "score" : "time"}/${val.level_id}`}>
                      {val.isMisc ? val.level_name+" (Misc)" : val.level_name}
                    </Link></td>
                  <td>
                    <div className="submissions-user-info">
                    {val.country ?
                      <div><span className={`fi fi-${val.country.toLowerCase()}`}></span></div>
                      :
                      ""
                    }
                    <div><Link to={`/user/${val.user_id}`}>{val.username}</Link></div>
                    </div>
                  </td>
                  <td>{val.record}</td>
                  {val.live ? <td>Live</td> : <td>Non-live</td>}
                  <td>{val.proof !== "none" ? <a href={val.proof} target="_blank" rel="noopener noreferrer">☑️</a> : ''}</td>
                  <td>{val.comment}</td>
                  <td><button onClick={() => removeSubmission(val.created_at)}>☑️</button></td>
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