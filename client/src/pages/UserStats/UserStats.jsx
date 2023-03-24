/* ===== IMPORTS ===== */
import "./UserStats.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { StaticCacheContext } from "../../Contexts";
import { useContext, useEffect, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import UserStatsLogic from "./UserStats.js";
import UserStatsMedals from "./UserStatsMedals";
import UserStatsTotal from "./UserStatsTotal";
import UserStatsRecords from "./UserStatsRecords";

function UserStats({ submissionReducer }) {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const userId = path[2];
  const abb = path[3];
  const type = path[5];

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES & FUNCTIONS ===== */
  const [game, setGame] = useState(undefined);
  const [user, setUser] = useState(undefined);
  const [allLiveFilter, setAllLiveFilter] = useState("live");

  // hooks and functions from the js file
  const { 
    stats,
    fetchUserStats
  } = UserStatsLogic();

  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, when the staticCache object is updated
  useEffect(() => {
    if (staticCache.games.length > 0 && staticCache.profiles.length > 0) {
      // see if abb corresponds to a game stored in cache, and if userId corresponds to a profile stored in cache
      const games = staticCache.games, profiles = staticCache.profiles;
      const game = games.find(row => row.abb === abb);
      const profile = profiles.find(row => row.id === userId);

      // if either do not match, handle the error, and navigate to the home screen
      if (!game || !profile) {
        !game && console.log("Error: Invalid game.");
        !profile && console.log("Error: Invalid user.");
        navigate("/");
        return;
      }

      // otherwise, update the game & user state hooks, and fetch user stats
      setGame(game);
      setUser(profile);
      fetchUserStats(path, game, submissionReducer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache]);

  /* ===== USER STATS COMPONENT ===== */
  return game && user && stats ?
    <>
      <div className="stats-header">

        { /* User and game title */ }
        <h1>{ user.username }: { game.name } { capitalize(type) }</h1>

        { /* Return to user page button */ }
        <Link to={ `/user/${ user.id }` }>
          <button>Back to { user.username }'s Profile</button>
        </Link>

        { /* Live-input: Toggle records page between rendering all records and just live records */ }
        <div className="records-input">
          <label htmlFor="live">Live-records only: </label>
          <input
            id="live"
            type="checkbox"
            checked={ allLiveFilter === "live" }
            onChange={ () => setAllLiveFilter(allLiveFilter === "live" ? "all" : "live") }
          />
        </div>

      </div>

      { /* Stats body */ }
      <div className="stats-body">

        { /* Stats tables */ }
        <UserStatsTotal total={ stats[allLiveFilter].total } filter={ allLiveFilter } />
        <UserStatsMedals medals={ stats[allLiveFilter].medals } filter={ allLiveFilter } />

        { /* Stats records */ }
        <UserStatsRecords rankings={ stats[allLiveFilter].rankings } />

      </div>
    </>
  :

    // Loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default UserStats;