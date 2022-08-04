import "./totalizer.css";
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import Board from "./Board";
import TotalizerInit from './TotalizerInit';

function Totalizer() {
    const { title,
            isMisc, 
            showAllScore,
            showAllTime,
            scoreTotals,
            allScoreTotals,
            timeTotals,
            allTimeTotals,
            setShowAllScore,
            setShowAllTime,
            checkPath, 
            getTotalizer, 
            getLinkBack, 
            getLinkToMedal 
    } = TotalizerInit();

    useEffect(() => {
        checkPath();
        getTotalizer(false, false);
        getTotalizer(false, true);
        getTotalizer(true, false);
        getTotalizer(true, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);  

  return (
    <div className="totalizer">
        <div className="totalizer-header">
            <h1>{isMisc ? "Miscellaneous "+title : title} Totalizer</h1>
        </div>
        <Link to={getLinkBack()}>
          <button>Back to {title}'s Page</button>
        </Link>
        <Link to={getLinkToMedal()}>
          <button>{isMisc ? "Miscellaneous "+title : title}'s Medal Table Page</button>
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
            <Board isScore={true} data={ showAllScore ? allScoreTotals : scoreTotals } />
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
            <Board isScore={false} data={ showAllTime ? allTimeTotals : timeTotals } />
          </div>
        </div>
    </div>
  )
}

export default Totalizer