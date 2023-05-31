/* ===== IMPORTS ===== */
import "./UserStats.css";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageContext, StaticCacheContext } from "../../Contexts";
import { useContext, useEffect, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import UserStatsLogic from "./UserStats.js";
import UserStatsMedals from "./UserStatsMedals";
import UserStatsTotal from "./UserStatsTotal";
import UserStatsRecords from "./UserStatsRecords";

function UserStats({ submissionReducer }) {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[3];
  const category = path[4];
  const type = path[5];
  const isMisc = category === "misc" ? true : false;

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES & FUNCTIONS ===== */
  const [game, setGame] = useState(undefined);
  const [allLiveFilter, setAllLiveFilter] = useState("live");

  // hooks and functions from the js file
  const { 
    stats,
    fetchUserStats
  } = UserStatsLogic();

  // helper functions
  const { capitalize, categoryB2F } = FrontendHelper();
  const { hasMiscCategory } = GameHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, when the staticCache object is updated
  useEffect(() => {
    if (staticCache.games.length > 0 && staticCache.profiles.length > 0) {
      // see if abb corresponds to a game stored in cache
      const games = staticCache.games;
      const game = games.find(row => row.abb === abb);

      // if either do not match, handle the error, and navigate to the home screen
      if (!game) {
        addMessage("Invalid game.", "error");
        navigate("/");
        return;
      }

      // special case: we are at the path "/user/{profileId}/{abb}/misc/{type}", but the game has no misc charts
      if (category === "misc" && !hasMiscCategory(game)) {
        addMessage("The page you requested does not exist.", "error");
        navigate("/");
        return;
      } 

      // otherwise, update the game & user state hooks, and fetch user stats
      setGame(game);
      fetchUserStats(path, game, submissionReducer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache, location.pathname]);

  /* ===== USER STATS COMPONENT ===== */
  return game && stats ?
    <>
      <div className="stats-header">

        { /* User and game title */ }
        <h1>{ isMisc && categoryB2F(category) } { game.name }: { capitalize(type) }</h1>

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