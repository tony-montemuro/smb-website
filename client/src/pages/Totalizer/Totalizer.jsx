import "./totalizer.css";
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import Board from "./Board";
import TotalizerInit from './TotalizerInit';

function Totalizer() {
    // hooks and functions from init file
    const { 
      game,
      loading,
      isMisc, 
      showAllScore,
      showAllTime,
      scoreTotals,
      allScoreTotals,
      timeTotals,
      allTimeTotals,
      setShowAllScore,
      setShowAllTime,
      totalsQuery,
      getTimeTotal
    } = TotalizerInit();

    // first function will directly fetch score totals for the game
    // second function will first calculate the total time for the particuar game
    // once this is complete, it will call totalsQuery with the totalTime
    // second function is also used for path validation
    useEffect(() => {
        totalsQuery();
        getTimeTotal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);  

  return (
    <div className="totalizer">
        <div className="totalizer-header">
            <h1>{ isMisc ? "Miscellaneous "+ game.name : game.name } Totalizer</h1>
        </div>
        <Link to={ `/games/${ game.abb }` }>
          <button>Back to { game.name }'s Page</button>
        </Link>
        <Link to={ `/games/${ game.abb }/${ isMisc ? "misc" : "main" }/medals` }>
          <button>{ isMisc ? "Miscellaneous " + game.name : game.name }'s Medal Table Page</button>
        </Link>
        <div className="totalizer-body">
          <div className="totalizer-container">
            <h2>Score Totals</h2>
            <div className="totalizer-input">
              <label htmlFor="all">Include non-live scores: </label>
              <input 
                  id="all"
                  type="checkbox"
                  checked={showAllScore}
                  onChange={ () => setShowAllScore(!showAllScore) }
              />
            </div>
            <Board isScore={ true } data={ showAllScore ? allScoreTotals : scoreTotals } loading={ loading } />
          </div>
          <div className="totalizer-container">
            <h2>Time Totals</h2>
            <div className="totalizer-input">
              <label htmlFor="all">Include non-live times: </label>
              <input 
                  id="all"
                  type="checkbox"
                  checked={showAllTime}
                  onChange={ () => setShowAllTime(!showAllTime) }
              />
            </div>
            <Board isScore={ false } data={ showAllTime ? allTimeTotals : timeTotals } loading={ loading } />
          </div>
        </div>
    </div>
  );
};

export default Totalizer;