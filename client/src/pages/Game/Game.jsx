import "./game.css"

import React from "react";
import GameInit from "./GameInit";
import { useEffect } from "react";
import { Link } from "react-router-dom";

function Game() {
  const { loading,
          loadingMisc,
          title, 
          checkPath, 
          getModesLevels, 
          isRadioSelected, 
          handleModeChange, 
          ModeLevelTable 
        } = GameInit();

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
        <h1>{title}</h1>
      </div>
      <div className="game-middle">
        <label htmlFor="main">Main Charts:</label>
        <input 
          id="main"
          type="radio" 
          name="mode"
          value="main"
          checked={isRadioSelected("main")}
          onChange={handleModeChange}
          disabled={loading || loadingMisc}>
        </input>
        <label htmlFor="main">Miscellaneous Charts:</label>
        <input 
          id="misc"
          type="radio" 
          name="mode"
          value="misc"
          checked={isRadioSelected("misc")}
          onChange={handleModeChange}
          disabled={loading || loadingMisc}>
        </input>
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