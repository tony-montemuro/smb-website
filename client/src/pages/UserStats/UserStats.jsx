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
      scoreInfo,
      timeInfo,
      statsType,
      setLoading, 
      setStatsType,
      checkForUser,
      levelsQuery,
      queryAndGetTotalsMedals 
    } = UserStatsInit();

    // first, we need to do initial queries for checks and total calculations
    useEffect(() => {
      checkForUser();
      levelsQuery();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // if the initial queries are a success, we can query submissions to get medals and totals
    useEffect(() => {
      if (user !== null && game !== null) {
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
    <div className="user-stats">
      <div className="user-stats-header">
        <h1>{ user.username }: { game.name }</h1>
        <Link to={`/user/${user.id}`}>
          <button>Back to { user.username }'s Profile</button>
        </Link>
        <div className="user-stats-radio">
          <label htmlFor="Score">Score:</label>
          <input 
            id="score"
            type="radio" 
            value="Score"
            checked={ statsType === "Score" }
            onChange={ (e) => setStatsType(e.target.value) }>
          </input>
          <label htmlFor="Time">Time:</label>
          <input 
            id="score"
            type="radio" 
            value="Time"
            checked={ statsType === "Time" }
            onChange={ (e) => setStatsType(e.target.value) }>
          </input>
        </div>
      </div>
      <div className="stats-board">
        { statsType === "Score" ? 
          <StatsBoard info={ scoreInfo } user={ user } type={ statsType } game={ game } />
          :
          <StatsBoard info={ timeInfo } user={ user } type={ statsType } game={ game } />
        }
      </div>
    </div>
  );
};

export default UserStats;