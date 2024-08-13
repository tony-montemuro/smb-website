/* ===== IMPORTS ===== */
import { AppDataContext, GameContext } from "../../utils/Contexts";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import styles from "./Game.module.css";
import ButtonList from "../../components/ButtonList/ButtonList.jsx";
import Container from "../../components/Container/Container.jsx";
import GameHelper from "../../helper/GameHelper";
import ModeBody from "./ModeBody/ModeBody.jsx";
import RecentSubmissionsTable from "../../components/RecentSubmissionsTable/RecentSubmissionsTable.jsx";
import Rule from "./Rule/Rule.jsx";

function Game() {
  /* ===== CONTEXTS ===== */

  // appData state from app data context
  const { appData } = useContext(AppDataContext);

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== HELPER FUNCTIONS ===== */
  const { getGameCategories } = GameHelper();

  /* ===== VARIABLES ===== */
  const navigateTo = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];
  const gameCategories = getGameCategories(game);
  const firstCategory = gameCategories[0];
  
  /* ===== MEMOS ===== */
  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append("game_id", abb);
    return params;
  }, [abb]);

  /* ===== STATES ===== */
  const [selectedCategory, setSelectedCategory] = useState(category ? category : firstCategory);
  const [selectedMode, setSelectedMode] = useState(null);
  const modes = game.mode.filter(mode => mode.category === selectedCategory);

  /* ===== FUNCTIONS ===== */
  
  // simple function that handles the radio button change
  const handleChange = category => {
    setSelectedCategory(category);
    setSelectedMode(null);
    navigateTo(`/games/${ abb }/${ category }`);
  };

  /* ===== EFFECTS ====== */
  useEffect(() => {
    // special case: we are attempting to access a game page with a non-valid category
    if (category && !(gameCategories.includes(category))) {
      setSelectedCategory(firstCategory);
      navigateTo(`/games/${ abb }`);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== GAME COMPONENT ===== */
  return (
    <div className={ styles.game }>

      { /* Game Info - Render the game rules, and recent submissions */ }
      <div className={ styles.half }>
        <div className={ styles.info }>
          <Container title="Rules" largeTitle>
            <div className={ styles.rules }>
              <ol>
                { game.rule.map(row => {
                  return <Rule rule={ row.rule_name } key={ row.id } />;
                })}
              </ol>
            </div>
          </Container>
          <div className={ styles.recent }>
            <Container title="Recent Submissions" href={ `/recent-submissions?game_id=${ abb }` } largeTitle>
              <RecentSubmissionsTable searchParams={ searchParams } renderLevelContext />
            </Container>
          </div>
        </div>
      </div>

      { /* Game charts - Specifies the category of levels, and renders a list of charts to select. */ }
      <div className={ styles.charts }>
        <Container title="Charts" largeTitle>
          <div className={ styles.chartsBody }>
            { gameCategories.length > 1 &&
              <ButtonList
                buttons={ gameCategories.map(category => ({ name: appData.categories[category].name, value: category })) }
                current={ selectedCategory }
                setCurrent={ handleChange }
                wrap
              />
            }
            <div className={ styles.modes }>
              { modes.map(mode => {
                return (
                  <ModeBody 
                    category={ selectedCategory } 
                    modeName={ mode.name }
                    selectedMode={ selectedMode }
                    setSelectedMode={ setSelectedMode }
                    key={ `${ selectedCategory }_${ mode.name }` } 
                  />
                );
              })}
            </div>
          </div>
        </Container>

      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Game;