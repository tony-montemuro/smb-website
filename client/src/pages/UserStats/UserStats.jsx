/* ===== IMPORTS ===== */
import { MessageContext, ProfileContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./UserStats.module.css";
import Container from "../../components/Container/Container.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import Loading from "../../components/Loading/Loading.jsx";
import Medals from "./Stats/Medals.jsx";
import Records from "./Stats/Records.jsx";
import Total from "./Stats/Total.jsx";
import UserStatsLogic from "./UserStats.js";

function UserStats() {
  /* ===== CONTEXTS ===== */

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  // profiles state from profile context
  const { profile } = useContext(ProfileContext);

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
  const errorMessage = "The page you requested does not exist";

  /* ===== STATES & FUNCTIONS ===== */
  const [game, setGame] = useState(undefined);
  const [allLiveFilter, setAllLiveFilter] = useState("live");

  // hooks and functions from the js file
  const { 
    stats,
    fetchUserStats
  } = UserStatsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    // see if abb corresponds to a game the current user has submitted to
    const games = profile.submitted_games;
    const game = games.find(row => row.abb === abb);

    // if either do not match, handle the error, and navigate to the home screen
    if (!game) {
      addMessage(errorMessage, "error");
      navigate("/");
      return;
    }

    // special case #1: we are attempting to access a user stats page with a non-valid category
    const categories = getGameCategories(game);
    if (!(categories.includes(category))) {
      addMessage(errorMessage, "error");
      navigate("/");
      return;
    }

    // special case #2: we are attempting to access a totalizer page with a valid category, but an invalid type
    const types = getCategoryTypes(game, category);
    if (!(types.includes(type))) {
      addMessage(errorMessage, "error");
      navigate("/");
      return;
    }

    // otherwise, update the game, filter, & user state hooks, and fetch user stats
    setGame(game);
    setAllLiveFilter(game.live_preference ? "live" : "all");
    fetchUserStats(game, profileId, category, type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ===== USER STATS COMPONENT ===== */
  return game && stats ?
    <Container title={ game.name } largeTitle>
      <div>

        { /* Header - render the category + type, as well as a live filter */ }
        <div className={ styles.header }>
          <h2>{ categoryB2F(category) } ({ capitalize(type) })</h2>

          { /* Live filter: Toggle records page between rendering all records and just live records */ }
          <div className={ styles.filter }>
            <label htmlFor="live">Live-{ type }s only: </label>
            <input
              id="live"
              type="checkbox"
              checked={ allLiveFilter === "live" }
              onChange={ () => setAllLiveFilter(allLiveFilter === "live" ? "all" : "live") }
            />
          </div>

        </div>

        <hr />

        { /* Body - render each stats section */ }
        <>

          { /* Stats tables - render these only if it's a practice mode category */ }
          { isPracticeMode(category) &&
            <>
              <Total total={ stats[allLiveFilter].total } filter={ allLiveFilter } />
              <hr />
              <Medals medals={ stats[allLiveFilter].medals } filter={ allLiveFilter } />
              <hr />
            </>
          }

          { /* Stats records */ }
          <Records rankings={ stats[allLiveFilter].rankings } />

        </>
      </div>
    </Container>
  :
    <Loading />
};

/* ===== EXPORTS ===== */
export default UserStats;