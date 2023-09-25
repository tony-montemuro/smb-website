/* ===== IMPORTS ===== */
import "./Game.css";
import { GameContext, MessageContext } from "../../utils/Contexts";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import ModeBody from "./ModeBody";
import RecentSubmissionsTable from "../../components/RecentSubmissionsTable/RecentSubmissionsTable.jsx";

function Game() {
  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== HELPER FUNCTIONS ===== */
  const { categoryB2F } = FrontendHelper();
  const { getGameCategories } = GameHelper();

  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];
  const categories = getGameCategories(game);
  const searchParams = new URLSearchParams();
  searchParams.append("game_id", abb);

  /* ===== STATES AND FUNCTIONS ===== */
  const [selectedCategory, setSelectedCategory] = useState(category ? category : "main");
  const [selectedMode, setSelectedMode] = useState(null);
  
  // simple function that handles the radio button change
  const handleChange = category => {
    setSelectedCategory(category);
    setSelectedMode(null);
    navigate(`/games/${ abb }/${ category }`);
  };

  /* ===== EFFECTS ====== */
  useEffect(() => {
    // special case: we are attempting to access a game page with a non-valid category
    if (category && !(categories.includes(category))) {
      addMessage("The page you requested does not exist.", "error");
      navigate("/");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== GAME COMPONENT ===== */
  return (
    <div className="game">

      { /* Game Info - Render various information about a game */ }
      <div className="game-info">

        { /* Game Rules - Render the rules of each game as an ordered list. */ }
        <div className="game-rules">

          { /* Rules header */ }
          <h2>Rules</h2>

          { /* Ordered list of rules */ }
          <ol>
            { game.rule.map(row => {
              return <li key={ row.id }>{ row.rule_name }</li>
            })}
          </ol>

        </div>

        { /* Game Recent Submissions - Render the 5 most recent submissions to that game. */ }
        <div className="game-recent-submissions">

          { /* Recent Submissions header */ }
          <h2><Link to={ `/recent-submissions?game_id=${ abb }` }>Recent Submissions</Link></h2>

          { /* Recent Submissions table */ }
          <RecentSubmissionsTable renderGame={ false } searchParams={ searchParams } />

        </div>

      </div>

      { /* Game Level List - Specifies the category of levels, and renders a list of levels to select. */ }
      <div className="game-level-list">

        { /* Chart select title */ }
        <h2>Charts</h2>

        { /* Radio buttons to toggle between the categories. Only render these buttons if the game
        has more than 1 category. */ }
        <div className="game-radio-btns">
          { categories.length > 1 && categories.map(category => {
            return (
              <button 
                type="button"
                key={ category } 
                className={ `game-radio-btn${ category === selectedCategory ? ` game-radio-btn-selected` : "" }` }
                onClick={ () => handleChange(category) }
                title={ categoryB2F(category) }
              >
                { categoryB2F(category) }
              </button>
            );
          })}
        </div>

        { /* Mode body selector - Render rows of modes, each of which expands to a selection of levels */ }
        <div className="game-mode-selector">
          { game.mode.filter(mode => mode.category === selectedCategory).map(mode => {
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

    </div>
  );
};

/* ===== EXPORTS ===== */
export default Game;