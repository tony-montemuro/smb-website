/* ===== IMPORTS ===== */
import { AppDataContext, GameContext, MessageContext } from "../../utils/Contexts";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import styles from "./Totalizer.module.css";
import CachedPageControls from "../../components/CachedPageControls/CachedPageControls.jsx";
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

  // appData state from app data context
  const { appData } = useContext(AppDataContext);

  // game state & version state from game context
  const { game, version } = useContext(GameContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== HELPER FUNCTIONS ===== */
  const { capitalize } = FrontendHelper();
  const { getGameCategories, getCategoryTypes } = GameHelper();
  const { scrollToTop } = ScrollHelper();

  /* ===== VARIABLES ===== */
  const TABLE_LENGTH = 3;
  const USERS_PER_PAGE = 25;
  const navigateTo = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];
  const type = path[5];
  const categoryDetails = appData.categories[category];
  let categoryName, isPracticeMode;
  if (categoryDetails) {
    categoryName = categoryDetails.name;
    isPracticeMode = categoryDetails.practice;
  }
  const gameCategories = getGameCategories(game);
  const types = getCategoryTypes(game, category);

  /* ===== STATES AND FUNCTIONS ===== */
  const [tableState, setTableState] = useState(game.live_preference ? "live" : "all");
  const [pageNum, setPageNum] = useState(1);

  // states and functions from the js file
  const { totals, fetchTotals, getDecimalsByCategory } = TotalizerLogic();
  const decimalPlaces = getDecimalsByCategory(game, category);

  // FUNCTION 1: handleTableStateChange - code that executes each time the user toggles the table state
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (1 possible outcome):
  // the table state is swapped between live/all, and the page num is set back to 1
  const handleTableStateChange = () => {
    setTableState(tableState === "live" ? "all" : "live");
    setPageNum(1);
  };

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the user switches categories
  useEffect(() => {
    // special case #1: we are attempting to access a totalizer page with a non-valid category or non-practice mode category
    if (!(gameCategories.includes(category) && isPracticeMode)) {
      addMessage("Ranking does not exist.", "error", 5000);
      navigateTo(`/games/${ abb }`);
      return;
    }

    // special case #2: we are attempting to access a totalizer page with a valid category, but an invalid type
    if (!(types.includes(type))) {
      addMessage("Ranking does not exist.", "error", 5000);
      navigateTo(`/games/${ abb }`);
      return;
    }

    // if we made it past the special case, let's go ahead and compute the totals, and scroll to top of page
    fetchTotals(game, category, type);
    scrollToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // code that executes each time the version state changes
  useEffect(() => {
    if (totals) {
      fetchTotals(game, category, type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  /* ===== TOTALIZER COMPONENT ===== */
  return (
    <Container title={ `${ capitalize(type) } Totalizer` } largeTitle>
      <div className={ styles.totalizer }>

        { /* Totalizer header - render the category, as well as an input for user to swap between live-only and all */ }
        <div className={ styles.header }>
          <h2>{ categoryName }</h2>
          <div className={ styles.filter }>
            <label htmlFor="filter">Live-{ type }s only: </label>
            <input
              id="filter"
              type="checkbox"
              checked={ tableState === "live" }
              onChange={ handleTableStateChange }
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
                  { totals[tableState].slice((pageNum-1)*USERS_PER_PAGE, pageNum*USERS_PER_PAGE).map(row => {
                    return (
                      <TotalizerRow 
                        row={ row } 
                        topTotal={ totals[tableState][0].total } 
                        imageReducer={ imageReducer } key={ row.profile.id }
                        decimalPlaces={ decimalPlaces }
                      />
                    );
                  })}
                </TableContent>
              :
                <LoadingTable numCols={ TABLE_LENGTH } />
              }
            </tbody>

          </table>
        </div>
        
        { /* Render pagination controls at the bottom of this container */ }
        { totals &&
          <CachedPageControls 
            items={ totals[tableState] }
            itemsPerPage={ USERS_PER_PAGE }
            pageNum={ pageNum }
            setPageNum={ setPageNum }
            itemsName="Users"
          />
        }
        
      </div>
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default Totalizer;