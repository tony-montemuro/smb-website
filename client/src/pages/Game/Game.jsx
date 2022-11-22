import "./game.css"

import React from "react";
import GameInit from "./GameInit";
import { useEffect } from "react";
import { Link } from "react-router-dom";

function Game() {
  const { loading,
          title, 
          levelModes,
          miscLevelModes,
          modesLength,
          miscModesLength,
          setLoading,
          getModesLevels, 
          isRadioSelected, 
          handleModeChange, 
          ModeLevelTable,
          TotalizerBoards,
          MedalTableBoards
        } = GameInit();

  useEffect(() => {
    // now, if the number of properties for both levelModes and miscLevelModes has satisfied a particular property, it will mean that all the
    // data has been loaded from the backend, so the setLoading state can be updated
    if ((modesLength && miscModesLength) && (Object.keys(levelModes).length === modesLength+1 && Object.keys(miscLevelModes).length === miscModesLength+1)) {
      setLoading(false);
      console.log(levelModes);
      console.log(miscLevelModes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelModes, miscLevelModes]);

  useEffect(() => {
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
          disabled={loading}>
        </input>
        <label htmlFor="main">Miscellaneous Charts:</label>
        <input 
          id="misc"
          type="radio" 
          name="mode"
          value="misc"
          checked={isRadioSelected("misc")}
          onChange={handleModeChange}
          disabled={loading}>
        </input>
      </div>
      {loading ? 
        <p>Loading...</p>
        :
        <div className="game-body">
          <div className="level-select">
            <table>
              <ModeLevelTable />
            </table>
          </div>
          <div className="game-boards">
            <h2>Medal Tables</h2>
            <MedalTableBoards />
            <h2>Totalizer</h2>
            <TotalizerBoards />
          </div>
        </div>
      }
    </div>
  )
}

export default Game