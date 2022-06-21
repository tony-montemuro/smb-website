// styling
import "./levelboard.css";

// js imports
import React from "react";
import LevelboardInit from "./LevelboardInit";
import {useEffect} from "react";

function Levelboard() {
  const { loading, checkPath, getTitleAndRecords, Board } = LevelboardInit();

  useEffect(() => {
    checkPath();
    getTitleAndRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="levelboard">
      {loading ? 
        <p>Loading...</p> :
        <Board />
      }
    </div>

  )
}

export default Levelboard