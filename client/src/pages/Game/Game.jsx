/* ===== IMPORTS ===== */
import "./Game.css";
import { GameContext } from "../../Contexts";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import GameLogic from "./Game.js";
import ModeBody from "./ModeBody";
import RecentGameSubmissionRow from "./RecentGameSubmissionRow";

function Game() {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];

  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== STATES AND FUNCTIONS ===== */
  const [selectedRadioBtn, setSelectedRadioBtn] = useState(category ? category : "main");

  // states and functions from js file
  const { submissions, getSubmissions } = GameLogic();

  // helper functions
  const { capitalize } = FrontendHelper();

  // simple function that handles the radio button change
  const handleChange = (e) => {
    const category = e.target.value;
    setSelectedRadioBtn(category);
    navigate(`/games/${ abb }/${ category }`);
  };

  /* ===== EFFECTS ====== */
  useEffect(() => {
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
            <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo, quisquam veniam ipsam nulla ullam sint quam explicabo dolores labore, tempora perspiciatis quos delectus facere sapiente?</li>
            <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Et, ullam dolore eum voluptates maiores ad!</li>
            <li>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quisquam vel alias ratione beatae molestias recusandae omnis, cum voluptates numquam delectus, voluptatum odit deserunt aliquid enim? Accusantium facere nihil deleniti iure!</li>
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
                <th>Level</th>
                <th>Type</th>
                <th>Record</th>
                <th>Position</th>
              </tr>
            </thead>

            { /* Table body - render a row for each submission object in the array. */ }
            <tbody>
              { submissions.map(submission => {
                return <RecentGameSubmissionRow submission={ submission } key={ submission.id } />;
              })}
            </tbody>
          </table>
        </div>

      </div>

      { /* Game Level List - Specifies the category of levels, and renders a list of levels to select. */ }
      <div className="game-level-list">

        { /* Two radio buttons to toggle between two category modes: main and misc. */ }
        <div className="game-radio-btns">
          {[{ name: "main", alias: "Main" }, { name: "misc", alias: "Miscellaneous" }].map(category => {
            return (
              <div key={ category.name } className={ `game-radio-btn` }>
                <label htmlFor={ category.name }>{ category.alias } Levels:</label>
                <input 
                  type="radio" 
                  value={ category.name }
                  checked={ selectedRadioBtn === category.name }
                  onChange={ handleChange }>
                </input>
              </div>
            );
          })}
        </div>

        { /* Level title */ }
        <h2>{ capitalize(selectedRadioBtn) } Levels</h2>

        { /* Level select table - Render a table of modes, each of which expands to a selection of levels */ }
        <table>
          { game.mode.filter(mode => selectedRadioBtn === "misc" ? mode.misc : !mode.misc).map(mode => {
            return <ModeBody category={ selectedRadioBtn } modeName={ mode.name } key={ `${ selectedRadioBtn }_${ mode.name }` } />;
          })}
        </table>

      </div>

    </div>
};

/* ===== EXPORTS ===== */
export default Game;