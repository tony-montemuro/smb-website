import "./medals.css";
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import Board from "./Board";
import MedalsInit from './Medalsinit';

function Medals() {
    // hooks and functions from init file
    const { 
      game,
      loading,
      medals,
      setLoading,
      checkGame,
      medalTableQuery,
    } = MedalsInit();

    // code that is executed when the page is first loaded.
    // query to ensure that user is trying to load medal table of a legitimate game
    useEffect(() => {
      checkGame();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);  

    // if it is a valid game, we can query the score and time submissions to generate medal tables
    useEffect(() => {
      if (game.abb) {
        medalTableQuery("score");
        medalTableQuery("time");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game]);

    // once both queries have finished and medal tables are generated, update loading hook
    useEffect(() => {
      if (medals.score && medals.time) {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [medals]);  
      
  // medals component
  return (
    <>
      <div className="medals-header">
        <h1>{ game.isMisc ? "Miscellaneous " + game.name : game.name } Medal Table</h1>
        <Link to={ `/games/${ game.abb }` }>
          <button>Back to { game.name }'s Page</button>
        </Link>
        <Link to={ `/games/${ game.abb }/${ game.isMisc ? "misc" : "main" }/totalizer` }>
          <button> { game.isMisc ? "Miscellaneous " + game.name : game.name }'s Totalizer Page</button>
        </Link>
      </div>
      <div className="medals-body">
        { Object.keys(medals).map(mode => {
          return <Board key={ mode } data={ medals[mode] } loading={ loading } mode={ mode } />
        })}
      </div>
    </>
  );
};

export default Medals;