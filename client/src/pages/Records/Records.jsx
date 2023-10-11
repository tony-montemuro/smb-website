/* ===== IMPORTS ====== */
import { GameContext, MessageContext } from "../../utils/Contexts";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import styles from "./Records.module.css";
import Container from "../../components/Container/Container.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import Loading from "../../components/Loading/Loading.jsx";
import RecordsLogic from "./Records.js";
import RecordTable from "./RecordTable/RecordTable.jsx";

function Records() {
  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== HELPER FUNCTIONS ===== */
  const { capitalize, categoryB2F } = FrontendHelper();
  const { getGameCategories, getCategoryTypes } = GameHelper();

  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const category = path[3];
  const type = path[4];
  const categories = getGameCategories(game);
  const types = getCategoryTypes(game, category);

  /* ===== STATES AND FUNCTIONS ===== */
  const [filter, setFilter] = useState(game.live_preference ? "live" : "all");

  // states and functions from js file
  const {
    recordTable,
    fetchRecords,
    allGreater,
    numNotLive
  } = RecordsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the user switches between score and time
  useEffect(() => {
    // special case #1: we are attempting to access a records page with a non-valid category
    if (!(categories.includes(category))) {
      addMessage("The page you requested does not exist.", "error");
      navigate("/");
      return;
    }

    // special case #2: we are attempting to access a records page with a valid category, but an invalid type
    if (!(types.includes(type))) {
      addMessage("The page you requested does not exist.", "error");
      navigate("/");
      return;
    }

    // if we made it past the special case, let's go ahead and fetch all records
    fetchRecords(game, category, type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ===== RECORDS COMPONENT ===== */
  return (
    <Container title={ `${ capitalize(type) } World Records` } largeTitle>

      { /* Records header - render the category & an input for user to swap between live-only and all */ }
      <div className={ styles.header }>
        <h2>{ categoryB2F(category) }</h2>
        <div className={ styles.filter }>
          <label htmlFor="live">Live-records only: </label>
          <input
            id="live"
            type="checkbox"
            checked={ filter === "live" }
            onChange={ () => setFilter(filter === "live" ? "all" : "live") }
            disabled={ !recordTable }
          />
        </div>
      </div>

      { /* Render a record table for each mode, if the `recordTable` state is defined */ }
      { recordTable ?
        <>
          <p><em>There are </em><strong>{ numNotLive() }</strong><em> level(s) where the live record is worse than the overall record.</em></p>
          { Object.keys(recordTable[filter]).map(mode => {
            return <RecordTable 
              recordTable={ recordTable }
              filter={ filter }
              mode={ mode } 
              allGreater={ allGreater } 
              key={ mode } 
            />
          })}
        </>
      :
        <Loading />
      }
      
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default Records;