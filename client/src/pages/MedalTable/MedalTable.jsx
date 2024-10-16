/* ===== IMPORTS ===== */
import { AppDataContext, GameContext, MessageContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./MedalTable.module.css";
import BronzeIcon from "../../assets/svg/Icons/BronzeIcon.jsx";
import CachedPageControls from "../../components/CachedPageControls/CachedPageControls.jsx";
import Container from "../../components/Container/Container.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import GoldIcon from "../../assets/svg/Icons/GoldIcon.jsx";
import LoadingTable from "../../components/LoadingTable/LoadingTable.jsx";
import MedalTableLogic from "./MedalTable.js";
import MedalTableRow from "./MedalTableRow.jsx";
import PlatinumIcon from "../../assets/svg/Icons/PlatinumIcon.jsx";
import ScrollHelper from "../../helper/ScrollHelper";
import SilverIcon from "../../assets/svg/Icons/SilverIcon.jsx";
import TableContent from "../../components/TableContent/TableContent.jsx";
import UrlHelper from "../../helper/UrlHelper.js";

function MedalTable({ imageReducer }) {
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
  const { addAllExistingSearchParams } = UrlHelper();

  /* ===== VARIABLES ===== */
  const TABLE_LENGTH = 6;
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
  const [pageNum, setPageNum] = useState(1);

  // states and functions from the js file
  const { 
    medalTable,
    fetchMedals
  } = MedalTableLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the user switches categories
  useEffect(() => {
    // special case #1: we are attempting to access a medals page with a non-valid or non-practice mode category
    const gameUrl = addAllExistingSearchParams(`/games/${ abb }`);
    if (!(gameCategories.includes(category) && isPracticeMode)) {
      addMessage("Ranking does not exist.", "error", 5000);
      navigateTo(gameUrl);
      return;
    }

    // special case #2: we are attempting to access a medals page with a valid category, but an invalid type
    if (!(types.includes(type))) {
      addMessage("Ranking does not exist.", "error", 5000);
      navigateTo(gameUrl);
      return;
    }

    // if we made it past the special case, let's go ahead and fetch the medal table, and scroll to top of page
    fetchMedals(abb, category, type);
    scrollToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // code that executes when the version changes
  useEffect(() => {
    if (medalTable) {
      fetchMedals(abb, category, type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);
      
  /* ===== MEDALS COMPONENT ===== */
  return (
    <Container title={ `${ capitalize(type) } Medal Table` } largeTitle>
      <div className={ styles.header }>
        <h2>{ categoryName }</h2>
        <em>Remember that medals are only awarded to submissions with live proof.</em>
      </div>
      <div className={ `table ${ styles.medalTable }` }>
        <table>
          
          { /* Table header - specifies the information displayed in each cell of the medal table */ }
          <thead>
            <tr>
              <th>Position</th>
              <th>Name</th>
              <th>
                <div className={ styles.medalsIcon }><PlatinumIcon isPlural /></div>
              </th>
              <th>
                <div className={ styles.medalsIcon }><GoldIcon isPlural /></div>
              </th>
              <th>
                <div className={ styles.medalsIcon }><SilverIcon isPlural /></div>
              </th>
              <th>
                <div className={ styles.medalsIcon }><BronzeIcon isPlural /></div>
              </th>
            </tr>
          </thead>

          { /* Table body - render a row for each medals table object in the table array. */ }
          <tbody>
            { medalTable ?
              <TableContent 
                items={ medalTable } 
                emptyMessage="There have been no live submissions to this game's category or version!"
                numCols={ TABLE_LENGTH }
              >
                { medalTable.slice((pageNum-1)*USERS_PER_PAGE, pageNum*USERS_PER_PAGE).map(row => {
                  return <MedalTableRow row={ row } imageReducer={ imageReducer } key={ row.profile.id } />;
                })}
              </TableContent>
            :
              <LoadingTable numCols={ TABLE_LENGTH } />
            }
          </tbody>
          
        </table>
      </div>

      { /* Render pagination controls at the bottom of this container */ }
      { medalTable &&
        <CachedPageControls 
          items={ medalTable }
          itemsPerPage={ USERS_PER_PAGE }
          pageNum={ pageNum }
          setPageNum={ setPageNum }
          itemsName="Users"
        />
      }
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default MedalTable;