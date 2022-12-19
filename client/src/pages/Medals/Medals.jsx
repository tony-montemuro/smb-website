import "./medals.css";
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import Board from "./Board";
import MedalsInit from './Medalsinit';

function Medals() {
    // hooks and functions from init file
    const { 
      game,
      validGame,
      loading,
      scoreLoading,
      timeLoading,
      isMisc, 
      scoreMedals,
      timeMedals,
      setLoading,
      checkGame,
      medalTableQuery
    } = MedalsInit();

    // first, query to ensure that user is trying to load medal table of a legitimate game
    useEffect(() => {
      checkGame();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);  

    // if it is a valid game, we can query the score and time submissions to generate medal tables
    useEffect(() => {
      if (validGame) {
        medalTableQuery("score");
        medalTableQuery("time");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validGame]);

    // once both queries have finished and medal tables are generated, update loading hook
    useEffect(() => {
      if (!scoreLoading && !timeLoading) {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scoreLoading, timeLoading]);  
      
  return (
    <div className="medals">
        <div className="medals-header">
            <h1>{ isMisc ? "Miscellaneous " + game.name : game.name } Medal Table</h1>
        </div>
        <Link to={ `/games/${ game.abb }` }>
          <button>Back to { game.name }'s Page</button>
        </Link>
        <Link to={ `/games/${ game.abb }/${ isMisc ? "misc" : "main" }/totalizer` }>
          <button> { isMisc ? "Miscellaneous " + game.name : game.name }'s Totalizer Page</button>
        </Link>
        <div className="medals-body">
          <div className="medals-container">
            <h2>Score Medal Table</h2>
            <Board data={ scoreMedals } loading={ loading } />
          </div>
          <div className="medals-container">
            <h2>Time Medal Table</h2>
            <Board data={ timeMedals } loading={ loading } />
          </div>
        </div>
    </div>
  );
};

export default Medals;