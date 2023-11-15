/* ===== IMPORTS ===== */
import { GameContext, MessageContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./MedalTable.module.css";
import BronzeIcon from "../../assets/svg/Icons/BronzeIcon.jsx";
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

function MedalTable({ imageReducer }) {
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
  const TABLE_LENGTH = 6;
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];
  const type = path[5];
  const categories = getGameCategories(game);
  const types = getCategoryTypes(game, category);

  /* ===== STATES AND FUNCTIONS ===== */

  // states and functions from the js file
  const { 
    medalTable,
    fetchMedals
  } = MedalTableLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the user switches categories
  useEffect(() => {
    // special case #1: we are attempting to access a medals page with a non-valid or non-practice mode category
    if (!(categories.includes(category) && isPracticeMode(category))) {
      addMessage("Ranking does not exist.", "error", 5000);
      navigate(`/games/${ abb }`);
      return;
    }

    // special case #2: we are attempting to access a medals page with a valid category, but an invalid type
    if (!(types.includes(type))) {
      addMessage("Ranking does not exist.", "error", 5000);
      navigate(`/games/${ abb }`);
      return;
    }

    // if we made it past the special case, let's go ahead and fetch the medal table, and scroll to top of page
    fetchMedals(abb, category, type);
    scrollToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
      
  /* ===== MEDALS COMPONENT ===== */
  return (
    <Container title={ `${ capitalize(type) } Medal Table` } largeTitle>
      <h2 className={ styles.header }>{ categoryB2F(category) }</h2>
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
                emptyMessage="There have been no live submissions to this game's category!"
                numCols={ TABLE_LENGTH }
              >
                { medalTable.map(row => {
                  return <MedalTableRow row={ row } imageReducer={ imageReducer } key={ row.profile.id } />;
                })}
              </TableContent>
            :
              <LoadingTable numCols={ TABLE_LENGTH } />
            }
          </tbody>
          
        </table>
      </div>
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default MedalTable;