import React from "react";
import GameInit from "./GameInit";
import { useEffect } from "react";

function Game() {
  const { levelModes, checkPath, getModesLevels, ModeLevel } = GameInit();

  useEffect(() => {
    checkPath();
    getModesLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="game">
      {levelModes['modes'].map((val) => {
        return <ModeLevel child={val} />
      })}
    </div>
  )
}

export default Game