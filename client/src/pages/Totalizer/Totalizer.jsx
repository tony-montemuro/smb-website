/* ===== IMPORTS ===== */
import { GameContext, MessageContext } from "../../utils/Contexts";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import styles from "./Totalizer.module.css";
import Container from "../../components/Container/Container.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import LoadingTable from "../../components/LoadingTable/LoadingTable.jsx";
import ScrollHelper from "../../helper/ScrollHelper";
import TableContent from "../../components/TableContent/TableContent";
import TotalizerLogic from "./Totalizer.js";
import TotalizerRow from "./TotalizerRow.jsx";

function Totalizer({ imageReducer }) {
  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== HELPER FUNCTIONS ===== */
  const { capitalize, categoryB2F } = FrontendHelper();
  const { getGameCategories, getCategoryTypes, isPracticeMode } = GameHelper();
  const { scrollToTop } = ScrollHelper();

  /* ===== VARIABLES ===== */
  const TABLE_LENGTH = 3;
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const category = path[3];
  const type = path[5];
  const categories = getGameCategories(game);
  const types = getCategoryTypes(game, category);

  /* ===== STATES AND FUNCTIONS ===== */
  const [tableState, setTableState] = useState(game.live_preference ? "live" : "all");

  // states and functions from the js file
  const {
    totals,
    fetchTotals
  } = TotalizerLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the user switches categories
  useEffect(() => {
    // special case #1: we are attempting to access a totalizer page with a non-valid category or non-practice mode category
    if (!(categories.includes(category) && isPracticeMode(category))) {
      addMessage("The page you requested does not exist.", "error");
      navigate("/");
      return;
    }

    // special case #2: we are attempting to access a totalizer page with a valid category, but an invalid type
    if (!(types.includes(type))) {
      addMessage("The page you requested does not exist.", "error");
      navigate("/");
      return;
    }

    // if we made it past the special case, let's go ahead and compute the totals, and scroll to top of page
    fetchTotals(game, category, type);
    scrollToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ===== TOTALIZER COMPONENT ===== */
  return (
    <Container title={ `${ capitalize(type) } Totalizer` } largeTitle>
      <div className={ styles.totalizer }>

        { /* Totalizer header - render the category, as well as an input for user to swap between live-only and all */ }
        <div className={ styles.header }>
          <h2>{ categoryB2F(category) }</h2>
          <div className={ styles.filter }>
            <label htmlFor="filter">Live-{ type }s only: </label>
            <input
              id="filter"
              type="checkbox"
              checked={ tableState === "live" }
              onChange={ () => setTableState(tableState === "live" ? "all" : "live") }
            />
          </div>
        </div>

        <div className={ `table ${ styles.totalizerTable }` }>
          <table>
          
            { /* Table header - specifies the information displayed in each cell of the board */ }
            <thead>
              <tr>
                <th>Position</th>
                <th>Name</th>
                <th>Total { capitalize(type) }</th>
              </tr>
            </thead>

            { /* Table body - render a row for each totals object in the array. */ }
            <tbody>
              { totals ? 
                <TableContent 
                  items={ totals[tableState] } 
                  emptyMessage={ `There have been no ${ tableState === "live" ? "live" : "" } submissions to this game's category!` }
                  numCols={ TABLE_LENGTH }
                >
                  { totals[tableState].map(row => {
                    return <TotalizerRow row={ row } topTotal={ totals[tableState][0].total } imageReducer={ imageReducer } key={ row.profile.id } />
                  })}
                </TableContent>
              :
                <LoadingTable numCols={ TABLE_LENGTH } />
              }
            </tbody>

          </table>
        </div>
        
      </div>
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default Totalizer;