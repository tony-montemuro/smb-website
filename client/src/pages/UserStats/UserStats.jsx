import "./userstats.css";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import UserStatsInit from "./UserStatsInit";
import StatsBoard from "./StatsBoard";

function UserStats() {
    // hooks and functions from init file
    const { 
      loading,
      loadingScore,
      loadingTime,
      game,
      totalTime, 
      user, 
      scoreTotal,
      scoreMedals,
      timeTotal,
      timeMedals,
      setLoading, 
      checkForUser,
      checkGame,
      getTimeTotal,
      queryAndGetTotalsMedals 
    } = UserStatsInit();

    // first, we need to do initial queries for checks and total calculations
    useEffect(() => {
      checkForUser();
      checkGame();
      getTimeTotal();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // if the initial queries are a success, we can query submissions to get medals and totals
    useEffect(() => {
      if (user !== null && game !== null && totalTime !== null) {
        queryAndGetTotalsMedals();
        queryAndGetTotalsMedals(totalTime);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, game, totalTime]);

    // once both time and score have queried and processed, we can update loading hook
    useEffect(() => {
      if (!loadingScore && !loadingTime) {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadingScore, loadingTime]);

  return (
    loading ?
    <p>Loading...</p>
    :
    <div className="page">
      <div className="user-stats-header">
        <h1>{ user.username }'s { game.name } Page</h1>
        <Link to={`/user/${user.id}`}>
          <button>Back to { user.username }'s Profile</button>
        </Link>
      </div>
      <div className="stats-board">
        <StatsBoard total={ scoreTotal } medals={ scoreMedals } user={ user } mode={ "Score" } />
        <StatsBoard total={ timeTotal } medals={ timeMedals } user={ user } mode={ "Time" } />
      </div>
    </div>
  );
};

export default UserStats;