import "./totalizer.css";
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import TotalsBoard from "./TotalsBoard";
import TotalizerInit from './TotalizerInit';

function Totalizer({ cache }) {
  // hooks and functions from init file
  const {
    loading, 
    game,
    totals,
    setLoading,
    generateTotals
  } = TotalizerInit();

  // code that is ran when the page first loads, or when the games or levels state is changed
  useEffect(() => {
    if (cache.games && cache.levels) {
      generateTotals("score", cache.games, cache.levels, cache.scoreSubmissionState);
      generateTotals("time", cache.games, cache.levels, cache.timeSubmissionState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cache.games, cache.levels]);

    // once all the total tables have been generated, set loading to false
    useEffect(() => {
      if (totals.score && totals.time) {
        console.log(totals);
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totals]);

  // totalizer component
  return (
    <>
      <div className="totalizer-header">
        <h1>{ game.isMisc ? "Miscellaneous "+ game.name : game.name } Totalizer</h1>
        <Link to={ `/games/${ game.abb }` }>
          <button>Back to { game.name }'s Page</button>
        </Link>
        <Link to={ `/games/${ game.abb }/${ game.isMisc ? "misc" : "main" }/medals` }>
          <button>{ game.isMisc ? "Miscellaneous " + game.name : game.name }'s Medal Table Page</button>
        </Link>
      </div>
      <div className="totalizer-body">
        { Object.keys(totals).map(type => {
          return <TotalsBoard key={ type } type={ type } data={ totals[type] } loading={ loading } imageReducer={ cache.imageReducer } />
        })}
      </div>
    </>
  );
};

export default Totalizer;