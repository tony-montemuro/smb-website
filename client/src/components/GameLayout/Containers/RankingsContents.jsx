/* ===== IMPORTS ====== */
import { AppDataContext, GameContext } from "../../../utils/Contexts";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RankingsContainer.module.css";
import FrontendHelper from "../../../helper/FrontendHelper";
import GameHelper from "../../../helper/GameHelper";

function RankingsContents({ category }) {
  /* ===== CONTEXTS ===== */

  // appData state from app data context
  const { appData } = useContext(AppDataContext);
  
  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== HELPER FUNCTIONS ===== */
  const { capitalize } = FrontendHelper();
  const { getGameCategories, getCategoryTypes } = GameHelper();
  
  /* ===== VARIABLES ===== */
  const { name: categoryName, practice: isPracticeMode } = appData.categories[category];
  const types = getCategoryTypes(game, category);
  const navigateTo = useNavigate();
  let rankings = [ { name: "World Records", path: "" } ];
  rankings = isPracticeMode ? rankings.concat([
    { name: "Totalizers", path: "/totalizer" },
    { name: "Medal Tables", path: "/medals" }
  ]) : rankings;

  /* ===== GAME LAYOUT INFO COMPONENT ===== */
  return (
    <div className={ styles.rankingsContainer }>
      <div className={ styles.rows }>

        { /* Render the name of the category */ }
        <h2 className={ styles.row }>{ categoryName }</h2>

        { /* For each ranking in the category, render a row containing the name of the ranking, and buttons to each page */ }
        { rankings.map(ranking => {
          return (
            <div className={ styles.row } key={ ranking.name }>
              <span>{ ranking.name }</span>
              <div className={ styles.btns }>
                { types.map(type => {
                  return (
                    <button 
                      type="button"
                      onClick={ () => navigateTo(`/games/${ game.abb }/${ category }${ ranking.path }/${ type }`) } 
                      key={ type }
                    >
                      { capitalize(type) }
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    
      {/* Only render an `hr` tag if NOT the final category */}
      { category !== getGameCategories(game).at(-1) && <hr /> }
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default RankingsContents;