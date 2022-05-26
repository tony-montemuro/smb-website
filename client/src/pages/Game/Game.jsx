import React from "react";
import GameInit from "./GameInit";
import { useEffect } from "react";

function Game() {
  const { modeList, checkPath, getModesLevels } = GameInit();

  useEffect(() => {
    checkPath();
    getModesLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="game">
      {modeList.map((val) => {
        return <p>{val}</p>
      })}
    </div>
  )
}

export default Game