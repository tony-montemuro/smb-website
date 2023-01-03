import "./records.css";
import React, { Fragment, useEffect } from "react";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import RecordsInit from "./RecordsInit";

function Records() {
  // states and functions from init file
  const { 
    loading,
    levels,
    recordTable, 
    game,
    queryLevels,
    addWorldRecords
  } = RecordsInit();

  // helper functions
  const { capitalize, cleanLevelName } = FrontendHelper();

  // code that is executed when the page is loaded
  useEffect(() => {
    queryLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // code that is executed once array of levels is loaded
  useEffect(() => {
    if (levels.length > 0) {
      addWorldRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels]);

  // records component
  return (
    <>
      <div className="records-header">
        <h1>{ game.name }: { capitalize(game.mode) } World Records</h1>
        <div className="records-buttons">
          <Link to={ { pathname: `/games/${ game.abb }` } }>
            <button disabled={ loading }>Back to { game.name }'s Page</button>
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
                            to={ { pathname: `/games/${ game.abb }/${ game.category }/${ game.mode }/${ level.level }` } } 
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