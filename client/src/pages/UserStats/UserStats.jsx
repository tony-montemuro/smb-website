import "./userstats.css";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";
import UserStatsInit from "./UserStatsInit";

function UserStats() {
    // hooks and functions from init file
    const { 
      loading,
      game,
      user, 
      board,
      setLoading, 
      dispatchboard,
      checkForUser,
      levelsQuery,
      queryAndCalc
    } = UserStatsInit();

    // helper functions
    const { capitalize, cleanLevelName } = FrontendHelper();

    // first, we need to do initial queries for checks and total calculations
    useEffect(() => {
      checkForUser();
      levelsQuery();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // if the initial queries are a success, we can query submissions to get medals and totals
    useEffect(() => {
      if (user && game) {
        queryAndCalc();
        queryAndCalc(game.timeTotal);
        console.log(user);
        console.log(game);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, game]);

    // once both time and score have queried and processed, we can update loading hook
    useEffect(() => {
      if (board.score && board.time) {
        setLoading(false);
        console.log(board);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [board]);

  // user stats component
  return (
    loading ?
    <p>Loading...</p>
    :
    <>
      <div className="stats-header">
        <h1>{ user.username }: { game.name }</h1>
        <Link to={ `/user/${user.id}` }>
          <button>Back to { user.username }'s Profile</button>
        </Link>
        <div className="stats-radio">
          <label htmlFor="score">Score:</label>
          <input 
            id="score"
            type="radio" 
            value="score"
            checked={ board.type === "score" }
            onChange={ (e) => dispatchboard({ field: "type", data: e.target.value }) }>
          </input>
          <label htmlFor="time">Time:</label>
          <input 
            id="score"
            type="radio" 
            value="time"
            checked={ board.type === "time" }
            onChange={ (e) => dispatchboard({ field: "type", data: e.target.value }) }>
          </input>
        </div>
      </div>
      <div className="stats-body">
        <h1>{ capitalize(board.type) }</h1>
        <div className="stats-table">
          <h2>{ capitalize(board.type) } Total</h2>
          { board[board.type].total.hasData ?
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Player</th>
                  <th>{ capitalize(board.type) } Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{ board[board.type].total.position }</td>
                  <td>
                    <div className="stats-user-info">
                      <div className="stats-table-image"><SimpleAvatar url={ user.avatar_url }/></div>
                      { user.country ?
                          <div><span className={ `fi fi-${ user.country.toLowerCase() }` }></span></div>
                          :
                          ""
                      }
                      <Link to={ `/user/${ user.user_id }` }>{ user.username }</Link>
                    </div>
                  </td>
                  { board.type === "score" ?
                    <td>{ board[board.type].total.total }</td>
                  :
                    <td>{ board[board.type].total.hours }:{ board[board.type].total.minutes }:{ board[board.type].total.seconds }.{ board[board.type].total.centiseconds }</td>
                  }
                </tr>
              </tbody>
            </table>
          :
            <p><i>This user has not submitted to this category.</i></p>
          }
        </div>
        <div className="stats-table">
          <h2>{ capitalize(board.type) } Medals</h2>
          { board[board.type].medals.hasData ?
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Player</th>
                  <th>Platinum</th>
                  <th>Gold</th>
                  <th>Silver</th>
                  <th>Bronze</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{ board[board.type].medals.position }</td>
                  <td>
                    <div className="stats-user-info">
                      <div className="stats-table-image"><SimpleAvatar url={ user.avatar_url }/></div>
                      { user.country ?
                        <div><span className={ `fi fi-${ user.country.toLowerCase() }` }></span></div>
                      :
                        ""
                      }
                     <Link to={ `/user/${ user.user_id }` }>{ user.username }</Link>
                    </div>
                  </td>
                  <td>{ board[board.type].medals.platinum }</td>
                  <td>{ board[board.type].medals.gold }</td>
                  <td>{ board[board.type].medals.silver }</td>
                  <td>{ board[board.type].medals.bronze }</td>
                </tr> 
              </tbody>
            </table>
          :
            <p><i>This user has not submitted to this category.</i></p>
          }
        </div>
        <div className="stats-records">
          <h2>Best { capitalize(board.type) }s</h2>
          { Object.keys(board[board.type].rankings).map(mode => {
            return (
              <table key={mode}>
                <thead>
                  <tr>
                    <th colSpan={ 4 }>{ cleanLevelName(mode) }</th>
                  </tr>
                  <tr>
                    <th>Level Name</th>
                    <th>{ capitalize(board.type) }</th>
                    <th>Position</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  { board[board.type].rankings[mode].map(level => {
                    return (
                      <tr key={ level.level }>
                        <td>
                          <Link
                            to={ { pathname: `/games/${ game.abb }/${ game.category }/${ board.type }/${ level.level }` } }
                            className="stats-records-links"
                          >
                            {cleanLevelName(level.level)}
                          </Link>
                        </td>
                        <td>{ level.record }</td>
                        <td>{ level.position }</td>
                        <td>{ level.date }</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default UserStats;