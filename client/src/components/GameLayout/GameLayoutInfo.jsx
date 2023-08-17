/* ===== IMPORTS ====== */
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";

function GameLayoutInfo({ category, game }) {
  /* ===== HELPER FUNCTIONS ===== */
  const { capitalize, categoryB2F } = FrontendHelper();
  const { getCategoryTypes } = GameHelper();
  
  /* ===== VARIABLES ===== */
  const types = getCategoryTypes(game, category);

  /* ===== GAME LAYOUT INFO COMPONENT ===== */
  return (
    <div className="game-layout-body-info">

      { /* Header - Render the category of rankings */ }
      <h2>{ categoryB2F(category) } Rankings</h2>
      
      <hr />

      { /* Game layout rankings - render each of the 3 ranking containers */ }
      <div className="game-layout-rankings">
        
        { /* World Records - Render links to each World Record page of a category */ }
        <div className="game-layout-ranking-container">
          <h3>World Records</h3>
          <div className="game-layout-body-links">
            { types.map(type => {
              return <Link to={ `/games/${ game.abb }/${ category }/${ type }` } key={ type }>{ capitalize(type) }</Link>
            })}
          </div>
        </div>

        { /* Totalizers - Render links to each Totalizer page of a category */ }
        <div className="game-layout-ranking-container">
          <h3>Totalizers</h3>
          <div className="game-layout-body-links">
            { types.map(type => {
              return <Link to={ `/games/${ game.abb }/${ category }/totalizer/${ type }` } key={ type }>{ capitalize(type) }</Link>
            })}
          </div>
        </div>

        { /* Medal Tables - Render links to each Medal Table page of a category */ }
        <div className="game-layout-ranking-container">
          <h3>Medal Tables</h3>
          <div className="game-layout-body-links">
            { types.map(type => {
              return <Link to={ `/games/${ game.abb }/${ category }/medals/${ type }` } key={ type }>{ capitalize(type) }</Link>
            })}
          </div>
        </div>
      </div>
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameLayoutInfo;