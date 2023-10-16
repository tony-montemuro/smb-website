/* ===== IMPORTS ===== */
import styles from "./StatsDirectory.module.css";
import BoxArt from "../../BoxArt/BoxArt.jsx";
import CategoryDetails from "./CategoryDetails";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FrontendHelper from "../../../helper/FrontendHelper";
import GameHelper from "../../../helper/GameHelper";
import StylesHelper from "../../../helper/StylesHelper";

function CategoryMenu({ type, games, selectedGame, setSelectedGame, imageReducer }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { getGameCategories } = GameHelper();
  const { capitalize } = FrontendHelper();
  const { indexToParity } = StylesHelper();

  /* ====== CATEGORY MENU COMPONENT ===== */
  return (
    <div className={ styles.menu } key={ type }>

      { /* Render the name of the menu (based on the type parameter) */ }
      <h2>{ capitalize(type) } Games</h2>

      { /* Render the menu object, a list of clickable game items */ }
      <div className={ styles.menuBody }>
        { games.map((game, index) => {
          return (
            <div className={ `${ indexToParity(index) }` } key={ game.abb }>

              { /* First, render the game and it's box art. */ }
              <div className={ styles.game } onClick={ () => setSelectedGame(game.abb !== selectedGame ? game.abb : undefined) }>
                <div className={ styles.gameLeft }>
                  <BoxArt game={ game } imageReducer={ imageReducer } width={ 75 } />
                  <h3>{ game.name }</h3>
                </div>
                { game.abb === selectedGame ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon /> }
              </div>

              { /* Now, render category details component for the each selected game's category */ }
              { game.abb === selectedGame && getGameCategories(game).map((category, index) => {
                return (
                  <CategoryDetails 
                    game={ game } 
                    category={ category }
                    index={ index }
                    key={ `${ game.abb }_${ category }` } 
                  />
                );
              })}

            </div>
          );
        })}
      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default CategoryMenu;