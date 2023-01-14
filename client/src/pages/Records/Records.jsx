import "./records.css";
import React, { Fragment, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import RecordsInit from "./RecordsInit";

function Records({ games, levels, submissionState }) {
  // states and functions from init file
  const { 
    loading,
    recordTable, 
    game,
    generateWorldRecords
  } = RecordsInit();

  // helper functions
  const { capitalize, cleanLevelName } = FrontendHelper();

  // code that is executed on page load, when either the levelList or games state are changed, or
  // when the user swaps between the time & score world record pages
  const location = useLocation();
  useEffect(() => {
    if (games && levels) {
      generateWorldRecords(games, levels, submissionState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, games, levels]);

  // records component
  return (
    <>
      <div className="records-header">
        <h1>{ game.isMisc ? "Miscellaneous " : null }{ game.name }: { capitalize(game.type) } World Records</h1>
        <div className="records-buttons">
          <Link to={ `/games/${ game.abb }` }>
            <button disabled={ loading }>Back to { game.name }'s Page</button>
          </Link>
          <Link to={ `/games/${ game.abb }/${ game.category }/${ game.other }`}>
            <button disabled={ loading }>{ game.name }: { capitalize(game.other) } World Records</button>
          </Link>
        </div>
      </div>
      { loading ?
        <p>Loading...</p> 
      :
        <div className="records-body">
          { Object.keys(recordTable).map(mode => {
            return (
              <table key={ mode }>
                <tbody>
                  <tr>
                    <th colSpan={ 3 }>{ cleanLevelName(mode) }</th>
                  </tr>
                  <tr className="records-info-row">
                    <td>Level Name</td>
                    <td>Score</td>
                    <td>Player(s)</td>
                  </tr>
                  { recordTable[mode].map(level => {
                    return (
                      <tr key={ level.level }>
                        <td>
                          <Link
                            className="records-level-link" 
                            to={ `/games/${ game.abb }/${ game.category }/${ game.type }/${ level.level }` } 
                          >
                            { cleanLevelName(level.level) }
                          </Link>
                        </td>
                        <td>{ level.record }</td>
                        <td>{ level.name.map((user, index) => {
                          return (
                            <Fragment key={ user.id }>
                              <Link to={ `/user/${user.id}` }>{ user.username }</Link>
                              { index < level.name.length-1 ? ", " : null }
                            </Fragment>
                          );
                        })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );
          })}
        </div>
      }
    </>
  );
};

export default Records;