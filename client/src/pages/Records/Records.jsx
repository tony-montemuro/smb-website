/* ===== IMPORTS ====== */
import "./Records.css";
import { GameContext } from "../../Contexts";
import { Link, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import RecordsLogic from "./Records.js";
import RecordTable from "./RecordTable";

function Records({ submissionReducer }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];
  const type = path[4];
  const otherType = type === "score" ? "time" : "score";
  const isMisc = category === "misc" ? true : false;

  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== STATES AND FUNCTIONS ===== */
  const [allLiveFilter, setAllLiveFilter] = useState("live");

  // states and functions from js file
  const {
    recordTable,
    fetchRecords,
    numNotLive
  } = RecordsLogic();

  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the user switches between score and time
  useEffect(() => {
    fetchRecords(game, category, type, submissionReducer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ===== RECORDS COMPONENT ===== */
  return recordTable ?
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
            <button>{ isMisc && "Miscellaneous" } { game.name }: { capitalize(otherType) } World Records</button>
          </Link>

        </div>
      </div>

      { /* Records - Render a record table for each mode. */ }
      <div className="records-body">

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

        <p><i>There are</i> <b>{ numNotLive() }</b> <i>level(s) where the live record is worse than the overall record.</i></p>

        { /* Render a record table for each mode based on the allLiveFilter */ }
        { Object.keys(recordTable[allLiveFilter]).map(mode => {
          return <RecordTable mode={ mode } allLiveFilter={ allLiveFilter } recordTable={ recordTable } key={ mode } />
        })}

      </div>
      
    </>
  :
    // Loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default Records;