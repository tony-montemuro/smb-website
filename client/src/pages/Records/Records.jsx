/* ===== IMPORTS ====== */
import "./Records.css";
import { useContext, useEffect, useState } from "react";
import { StaticCacheContext } from "../../Contexts";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import RecordsLogic from "./Records.js";
import RecordTable from "./RecordTable";

function Records({ cache }) {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];
  const type = path[4];
  const otherType = type === "score" ? "time" : "score";
  const isMisc = category === "misc" ? true : false;

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES AND FUNCTIONS ===== */
  const [game, setGame] = useState(undefined);

  // states and functions from js file
  const {
    recordTable,
    fetchRecords
  } = RecordsLogic();

  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, when the staticCache object is updated, or when the user
  // switches between miscellaneous and main
  useEffect(() => {
    if (staticCache.games.length > 0) {
      // see if abb corresponds to a game stored in cache
      const games = staticCache.games;
      const game = games.find(row => row.abb === abb);

      // if not, we will print an error message, and navigate to the home screen
      if (!game) {
        console.log("Error: Invalid game.");
        navigate("/");
        return;
      }

      // update the game state hook, and fetch the totals
      setGame(game);
      fetchRecords(game, category, type, cache.submissionReducer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache, location.pathname]);

  /* ===== RECORDS COMPONENT ===== */
  return game && recordTable ?
    <>
      { /* Records Header - Displays the name of the game, as well as buttons to navigate to related pages. */ }
      <div className="records-header">

        { /* Game Title */ }
        <h1>{ isMisc && "Miscellaneous" } { game.name }: { capitalize(type) } World Records</h1>

        { /* Records Buttons - Buttons to navigate to related pages. */ }
        <div className="records-buttons">

          { /* Return to game page button. */ }
          <Link to={ `/games/${ abb }` }>
            <button>Back to { game.name }'s Page</button>
          </Link>

          { /* Other type world record page button. */ }
          <Link to={ `/games/${ abb }/${ category }/${ otherType }`}>
            <button>{ game.name }: { capitalize(otherType) } World Records</button>
          </Link>

        </div>
      </div>

      { /* Records - Render a record table for each mode. */ }
      <div className="records-body">
        { Object.keys(recordTable).map(mode => {
          return <RecordTable mode={ mode } recordTable={ recordTable } key={ mode } />
        })}
      </div>
      
    </>
  :
    // Loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default Records;