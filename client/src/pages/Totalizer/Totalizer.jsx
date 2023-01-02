import "./totalizer.css";
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import Board from "./Board";
import TotalizerInit from './TotalizerInit';

function Totalizer() {
    // hooks and functions from init file
    const {
      loading, 
      game,
      totals,
      setLoading,
      getGame,
      totalsQuery
    } = TotalizerInit();

    // first, set up the game state
    useEffect(() => {
      getGame();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    // once the game is verified, we can query totals tables for score & time
    useEffect(() => {
      if (game.abb) {
        totalsQuery("score");
        totalsQuery("time");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game]);

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
          return <Board key={ type } type={ type } data={ totals[type] } loading={ loading } />
        })}
      </div>
    </>
  );
};

export default Totalizer;