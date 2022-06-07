// styling
import "./levelboard.css";

// js imports
import React from "react";
import LevelboardInit from "./LevelboardInit";
import {useEffect} from "react";
import {Link} from "react-router-dom";

function Levelboard() {
  const { records, title, checkPath, getTitleAndRecords, swapLevels, getGame, getMode, getLevelId } = LevelboardInit();

  useEffect(() => {
    checkPath();
    getTitleAndRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="levelboard">
      <div className="levelboard-header">
        <div className="levelboard-title">
          <button onClick={() => swapLevels(getLevelId(0))}>←Prev</button>
          <h1>{title}</h1>
          <button onClick={() => swapLevels(getLevelId(1))}>Next→</button>
        </div>
        <div className="levelboard-back">
          <Link to={`/games/${getGame()}`}>
            <button>Back to Level Select</button>
          </Link>
        </div>
      </div>
      <div className="levelboard-container">
        <table>
          <tbody>
              <tr>
                <th>Position</th>
                <th>Name</th>
                <th>{getMode()}</th>
                <th>Date</th>
                <th>Monkey</th>
                <th>Proof</th>
              </tr>
              {records.map((val) => {
                return <tr>
                  <td>{val.Position}</td>
                  <td>{val.Name}</td>
                  <td>{getMode() === "Score" ? val.Score : val.Time}</td>
                  <td>{val.Month}/{val.Day}/{val.Year}</td>
                  <td>{val.Monkey}</td>
                  <td>{val.Proof !== "none" ? <a href={val.Proof} target="_blank" rel="noopener noreferrer">☑️</a> : ''}</td>
                </tr>  
              })}
          </tbody>
        </table>
      </div>
    </div>

  )
}

export default Levelboard