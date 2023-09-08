/* ===== IMPORTS ===== */
import "./UserStats.css";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageContext, StaticCacheContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import UserStatsLogic from "./UserStats.js";
import UserStatsMedals from "./UserStatsMedals";
import UserStatsTotal from "./UserStatsTotal";
import UserStatsRecords from "./UserStatsRecords";

function UserStats() {
  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== HELPER FUNCTIONS ===== */
  const { capitalize, categoryB2F } = FrontendHelper();
  const { getGameCategories, getCategoryTypes, isPracticeMode } = GameHelper();

  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const profileId = parseInt(path[2]);
  const abb = path[3];
  const category = path[4];
  const type = path[5];

  /* ===== STATES & FUNCTIONS ===== */
  const [game, setGame] = useState(undefined);
  const [allLiveFilter, setAllLiveFilter] = useState("live");

  // hooks and functions from the js file
  const { 
    stats,
    fetchUserStats
  } = UserStatsLogic();

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

      // special case #1: we are attempting to access a user stats page with a non-valid category
      const categories = getGameCategories(game);
      if (!(categories.includes(category))) {
        addMessage("The page you requested does not exist.", "error");
        navigate("/");
        return;
      }

      // special case #2: we are attempting to access a totalizer page with a valid category, but an invalid type
      const types = getCategoryTypes(game, category);
      if (!(types.includes(type))) {
        addMessage("The page you requested does not exist.", "error");
        navigate("/");
        return;
      }

      // otherwise, update the game, filter, & user state hooks, and fetch user stats
      setGame(game);
      setAllLiveFilter(game.live_preference ? "live" : "all");
      fetchUserStats(game, profileId, category, type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache, location.pathname]);

  /* ===== USER STATS COMPONENT ===== */
  return game && stats ?
    <>
      <div className="stats-header">

        { /* User and game title */ }
        <h1>{ game.name }: { categoryB2F(category) } { capitalize(type) }</h1>

        { /* Live-input: Toggle records page between rendering all records and just live records */ }
        <div className="records-input">
          <label htmlFor="live">Live-{ type }s only: </label>
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

        { /* Stats tables - render these only if it's a practice mode category */ }
        { isPracticeMode(category) &&
          <>
            <UserStatsTotal total={ stats[allLiveFilter].total } filter={ allLiveFilter } />
            <UserStatsMedals medals={ stats[allLiveFilter].medals } filter={ allLiveFilter } />
          </>
        }

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