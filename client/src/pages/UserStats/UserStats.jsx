/* ===== IMPORTS ===== */
import { AppDataContext, ProfileContext, MessageContext } from "../../utils/Contexts";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./UserStats.module.css";
import Container from "../../components/Container/Container.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import Loading from "../../components/Loading/Loading.jsx";
import Medals from "./Stats/Medals.jsx";
import Records from "./Stats/Records.jsx";
import Total from "./Stats/Total.jsx";
import UrlHelper from "../../helper/UrlHelper.js";
import UserStatsLogic from "./UserStats.js";

function UserStats() {
  /* ===== CONTEXTS ===== */
  
  // appData state from app data context
  const { appData } = useContext(AppDataContext);

  // profiles state from profile context
  const { profile } = useContext(ProfileContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== HELPER FUNCTIONS ===== */
  const { capitalize } = FrontendHelper();
  const { getGameCategories, getCategoryTypes } = GameHelper();
  const { getInitialVersion } = UrlHelper();

  /* ===== VARIABLES ===== */
  const navigateTo = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const profileId = parseInt(path[2]);
  const abb = path[3];
  const category = path[4];
  const type = path[5];
  const categories = appData.categories;
  const categoryDetails = categories[category];
  let categoryName, isPracticeMode;
  if (categoryDetails) {
    categoryName = categories[category].name;
    isPracticeMode = categories[category].practice;
  }
  const errorMessage = "User page does not exist.";

  /* ===== REFS ===== */

  // use this to store decimalPlaces, which can only be calculated after data fetch
  const decimalPlaces = useRef(null);

  /* ===== STATES & FUNCTIONS ===== */
  const [game, setGame] = useState(undefined);
  const [allLiveFilter, setAllLiveFilter] = useState("live");
  const [version, setVersion] = useState(undefined);

  // hooks and functions from the js file
  const { stats, fetchUserStats, handleVersionChange } = UserStatsLogic(decimalPlaces, setVersion);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    // see if abb corresponds to a game the current user has submitted to
    const games = profile.submitted_games;
    const game = games.find(row => row.abb === abb);

    // if either do not match, handle the error, and navigate to the home screen
    if (!game) {
      addMessage(errorMessage, "error", 5000);
      navigateTo(`/user/${ profileId }`);
      return;
    }

    // special case #1: we are attempting to access a user stats page with a non-valid category
    const gameCategories = getGameCategories(game);
    if (!(gameCategories.includes(category))) {
      addMessage(errorMessage, "error", 5000);
      navigateTo(`/user/${ profileId }`);
      return;
    }

    // special case #2: we are attempting to access a totalizer page with a valid category, but an invalid type
    const types = getCategoryTypes(game, category);
    if (!(types.includes(type))) {
      addMessage(errorMessage, "error", 5000);
      navigateTo(`/user/${ profileId }`);
      return;
    }

    // otherwise, update the game, filter, & user state hooks, and fetch user stats
    const version = getInitialVersion(game); 
    setGame(game);
    setVersion(version);
    setAllLiveFilter(game.live_preference ? "live" : "all");
    fetchUserStats(game, profileId, category, type, version?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // code that is executed when the version state changes
  useEffect(() => {
    // this will ensure the code only executes AFTER component mounts
    if (stats) {
      fetchUserStats(game, profileId, category, type, version?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  /* ===== USER STATS COMPONENT ===== */
  return game && stats ?
    <Container title={ game.name } largeTitle>
      <div>

        { /* Header - render the category + type, as well as a live filter */ }
        <div className={ `${ styles.header } ${ styles.verticalPadding }` }>
          <div className={ styles.header }>
            <h2>{ categoryName } ({ capitalize(type) })</h2>

            { game.versions?.length > 0 &&
              <div className={ styles.version }>
                <label htmlFor="version">Version: </label>
                <select 
                  id="version" 
                  onChange={ (e) => handleVersionChange(e, game) } 
                  value={ version.id }
                >
                  { game.versions.map(version => (
                    <option value={ version.id } key={ version.id } >{ version.version }</option>
                  ))}
                </select>
              </div>
            }
          </div>

          { /* Live filter: Toggle records page between rendering all records and just live records */ }
          <div className={ styles.filter }>
            <label htmlFor={ styles.live }>Live-{ type }s only: </label>
            <input
              id={ styles.live }
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
          { isPracticeMode &&
            <>
              <Total total={ stats[allLiveFilter].total } filter={ allLiveFilter } decimalPlaces={ decimalPlaces.current } />
              <hr />
              <Medals medals={ stats[allLiveFilter].medals } filter={ allLiveFilter } />
              <hr />
            </>
          }

          { /* Stats records */ }
          <Records rankings={ stats[allLiveFilter].rankings } game={ game } version={ version } />

        </>
      </div>
    </Container>
  :
    <Loading />
};

/* ===== EXPORTS ===== */
export default UserStats;