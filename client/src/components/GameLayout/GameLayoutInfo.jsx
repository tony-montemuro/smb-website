/* ===== IMPORTS ====== */
import { GameContext } from "../../utils/Contexts";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";

function GameLayoutInfo({ category }) {
  /* ===== CONTEXTS ===== */
  
  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== HELPER FUNCTIONS ===== */
  const { capitalize, categoryB2F } = FrontendHelper();
  const { getCategoryTypes, isPracticeMode } = GameHelper();
  
  /* ===== VARIABLES ===== */
  const types = getCategoryTypes(game, category);
  const navigate = useNavigate();

  /* ===== GAME LAYOUT INFO COMPONENT ===== */
  return (
    <div className="game-layout-body-info">
      { /* Header - Render the category of rankings */ }
      <h2>{ categoryB2F(category) }</h2>

      <hr />

      { /* Game layout rankings - render each of the 3 ranking containers */ }
      <div className="game-layout-info-rankings">
        
        { /* World Records - Render links to each World Record page of a category */ }
        <div className="game-layout-info-ranking-container">
          <h3>World Records</h3>
          <div className="game-layout-info-body-buttons">
            { types.map(type => {
              return (
                <button 
                  type="button"
                  onClick={ () => navigate(`/games/${ game.abb }/${ category }/${ type }`) } 
                  key={ type }
                >
                  { capitalize(type) }
                </button>
              );
            })}
          </div>
        </div>

        { /* Only render totalizer and medal table links if the category is "practice mode" */ }
        { isPracticeMode(category) &&
          <>

            { /* Totalizers - Render links to each Totalizer page of a category */ }
            <div className="game-layout-info-ranking-container">
              <h3>Totalizers</h3>
              <div className="game-layout-info-body-buttons">
                { types.map(type => {
                  return (
                    <button 
                      type="button" 
                      onClick={ () => navigate(`/games/${ game.abb }/${ category }/totalizer/${ type }`) } 
                      key={ type }
                    >
                      { capitalize(type) }
                    </button>
                  );
                })}
              </div>
            </div>

            { /* Medal Tables - Render links to each Medal Table page of a category */ }
            <div className="game-layout-info-ranking-container">
              <h3>Medal Tables</h3>
              <div className="game-layout-info-body-buttons">
                { types.map(type => {
                  return (
                    <button 
                      type="button"
                      onClick={ () => navigate(`/games/${ game.abb }/${ category }/medals/${ type }`) } 
                      key={ type }
                    >
                      { capitalize(type) }
                    </button>
                  );
                })}
              </div>
            </div>

          </>
        }
        
      </div>
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameLayoutInfo;