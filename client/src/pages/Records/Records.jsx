import "./records.css";
import React, { useEffect } from "react";
import RecordsInit from "./RecordsInit";
import FrontendHelper from "../../helper/FrontendHelper";
import { Link } from "react-router-dom";

function Records() {
  // hooks and functions from init file
  const { 
    loading,
    levels,
    levelModes, 
    game,
    queryModeLevels,
    addWorldRecords
  } = RecordsInit();

  // code that is executed when the page is loaded
  useEffect(() => {
    queryModeLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // code that is executed once array of levels is loaded
  useEffect(() => {
    if (levels.length > 0) {
      addWorldRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels]);

  // helper functions
  const { capitalize, cleanLevelName } = FrontendHelper();

  // records component
  return (
    loading ?
    <p>Loading...</p> 
  : 
    <div className="records">
      <h1>{ game.name }: { capitalize(game.mode) } World Records</h1>
      <div className="records-buttons">
        <Link to={{pathname: `/games/${ game.abb }`}}>
          <button>Back to { game.name }'s Page</button>
        </Link>
      </div>
      {levelModes["modes"].map(mode => {
        return (
          <table>
            <tbody key={mode}>
              <tr>
                <th></th>
                <th>{ cleanLevelName(mode) }</th>
                <th></th>
              </tr>
              <tr className="records-info-row">
                <td>Level Name</td>
                <td>Score</td>
                <td>Player(s)</td>
              </tr>
              {levelModes[mode].map(level => {
                return (
                  <tr key={ level.level }>
                    <td>{ cleanLevelName(level.level) } </td>
                    <td>{ level.record }</td>
                    <td>{ level.names }</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )
      })}
    </div>
  );
};

export default Records;