import "./submissions.css";
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { useEffect } from "react";
import SubmissionInit from "./SubmissionsInit";
import SubmissionsTable from "./SubmissionsTable";

function Submissions({ cache }) {
  // states and functions from the init file
  const { 
    loading, 
    submissions, 
    currentGame, 
    approved,
    approving,
    swapGame,
    addToApproved,
    removeFromApproved,
    approveAll
  } = SubmissionInit();

  // code that is executed when the page loads, or when cache fields are updated
  useEffect(() => {
    if (cache.games && cache.isMod !== null) {
      swapGame(cache.games[0].abb, cache.isMod, cache.submissionReducer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cache.games, cache.isMod]);

  // submissions component
  return (
    <>
      { cache.isMod ? 
        <>
          <div className="submissions-header">
            <h1>Recent Submissions</h1>
            <p><i>Below is the list of recent submissions. Please go through and review each submission for each game.</i></p>
            <p>To select a game, use the <b>Select Game</b> selection tool.</p>
            <p>If a submission is <b>valid</b>, add it to the list of approved records by pressing the <b>Approve</b> button
            for that submission. <b>NOTE:</b> In order to finalize the approval process, you <i>must</i> press
            the <b>Approve All</b> button under the <b>Approved Submissions</b> list. Remember, if you accidently add an invalid
            run to the <b>Approved Submissions</b> list, you can always remove it by pressing the <b>Unapprove</b> button. </p>
            <p>If you suspect a submission is <b>invalid</b>, first navigate to the board with the invalid
            submission by clicking on the <b>Level Name</b>. If you still are suspicious, remove the record
            by clicking the <b>Delete</b> button.</p>
          </div> 
          <div className="submissions-body">
            { currentGame ? 
              <div className="submissions-select">
                <h3>Select Game:</h3>
                <form>
                  <select
                    onChange={ (e) => swapGame(e.target.value, cache.submissionReducer) }
                    value={ currentGame }
                  >
                    { cache.games.map(val => {
                      return <option key={ val.abb } value={ val.abb }>{ val.name }</option>
                    })}
                  </select>
                </form>
              </div>
            :
              null
            }
            <div className="submissions-list">
              <h3>Approved Submissions:</h3>
              { approved.length > 0 ?
                <SubmissionsTable 
                  data={ { list: approved, isApproved: true } } 
                  games={ { current: currentGame, all: cache.games } }
                  toggleBtn={ approving } 
                  buttonFunc={ removeFromApproved }
                />
              :
                <p><i>Approve a submission to add it to the list!</i></p>
              }
              <button onClick={ () => approveAll() } disabled={ approved.length === 0 || approving }>Approve All</button>
              <h3>Submissions:</h3>
              { loading ? 
                <p>Loading...</p>
              :
                submissions[currentGame].length > 0 ?
                  <SubmissionsTable 
                    data={ { list: submissions[currentGame], isApproved: false } } 
                    games={ { current: currentGame, all: cache.games } }
                    toggleBtn={ approving } 
                    buttonFunc={ addToApproved } 
                  />
                :
                  <p><i>This game has no unapproved submissions!</i></p>
              }
            </div>
          </div>
        </>
      : 
        null
      }
    </>
  );
}

export default Submissions;