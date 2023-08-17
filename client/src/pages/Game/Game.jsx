/* ===== IMPORTS ===== */
import "./Game.css";
import { GameContext, MessageContext } from "../../utils/Contexts";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import GameLogic from "./Game.js";
import ModeBody from "./ModeBody";
import RecentSubmissionsRow from "../../components/RecentSubmissionsRow/RecentSubmissionsRow";

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

  /* ===== STATES AND FUNCTIONS ===== */
  const [selectedCategory, setSelectedCategory] = useState(category ? category : "main");

  // states and functions from js file
  const { submissions, getSubmissions } = GameLogic();
  
  // simple function that handles the radio button change
  const handleChange = category => {
    setSelectedCategory(category);
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

    // otherwise, let's get submissions
    getSubmissions(game.abb);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== GAME COMPONENT ===== */
  return submissions &&
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
          <h2>Recent Submissions</h2>

          { /* Recent Submissions table */ }
          <table>

            { /* Table header - specifies the information displayed in each cell of the table */ }
            <thead>
              <tr>
                <th>Submitted</th>
                <th>User</th>
                <th>Category</th>
                <th>Level</th>
                <th>Record</th>
                <th>Position</th>
              </tr>
            </thead>

            { /* Table body - render a row for each submission object in the array. */ }
            <tbody>
              { submissions.map(submission => {
                return <RecentSubmissionsRow submission={ submission } renderGame={ false } key={ submission.id } />;
              })}
            </tbody>
          </table>
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
                key={ category } 
                className={ `game-radio-btn ${ category === selectedCategory ? `game-radio-btn-selected` : "" }` }
                onClick={ () => handleChange(category) }
                title={ categoryB2F(category) }
              >
                { categoryB2F(category) }
              </button>
            );
          })}
        </div>

        { /* Level select table - Render a table of modes, each of which expands to a selection of levels */ }
        <table>
          { game.mode.filter(mode => mode.category === selectedCategory).map(mode => {
            return <ModeBody category={ selectedCategory } modeName={ mode.name } key={ `${ selectedCategory }_${ mode.name }` } />;
          })}
        </table>

      </div>

    </div>
};

/* ===== EXPORTS ===== */
export default Game;