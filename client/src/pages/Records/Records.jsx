/* ===== IMPORTS ====== */
import "./Records.css";
import { GameContext, MessageContext } from "../../utils/Contexts";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import RecordsLogic from "./Records.js";
import RecordTable from "./RecordTable";

function Records({ submissionReducer }) {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const category = path[3];
  const type = path[4];
  const isMisc = category === "misc" ? true : false;

  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES AND FUNCTIONS ===== */
  const [allLiveFilter, setAllLiveFilter] = useState(game.live_preference ? "live" : "all");

  // states and functions from js file
  const {
    recordTable,
    fetchRecords,
    numNotLive
  } = RecordsLogic();

  // helper functions
  const { capitalize, categoryB2F } = FrontendHelper();
  const { hasMiscCategory } = GameHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the user switches between score and time
  useEffect(() => {
    // special case: we are at the path "/games/{abb}/misc/{type}", but the game has no misc charts
    if (category === "misc" && !hasMiscCategory(game)) {
      addMessage("The page you requested does not exist.", "error");
      navigate("/");
      return;
    } 

    // if we made it past the special case, let's go ahead and fetch all records
    fetchRecords(game, category, type, submissionReducer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ===== RECORDS COMPONENT ===== */
  return recordTable ?
    <>
      { /* Records Header - Displays the name of the game, as well as buttons to navigate to related pages. */ }
      <div className="records-header">

        { /* Game Title */ }
        <h1>{ isMisc && categoryB2F(category) } { capitalize(type) } World Records</h1>

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