import "./game.css"

import React from "react";
import GameInit from "./GameInit";
import { useEffect } from "react";
import { Link } from "react-router-dom";

function Game() {
  const { loading, checkPath, getModesLevels, getGameTitle, ModeLevelTable } = GameInit();

  useEffect(() => {
    checkPath();
    getModesLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="game">
      <div className="game-header">
        <Link to={`/games`}>
          <button>Back to Game Select</button>
        </Link>
        <h1>{getGameTitle()}</h1>
      </div>
      {loading ? 
        <p>Loading...</p>
        :
        <div className="level-select">
          <table>
            <ModeLevelTable />
          </table>
        </div>
      }
    </div>
  )
}

export default Game