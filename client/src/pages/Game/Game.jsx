/* ===== IMPORTS ===== */
import "./Game.css";
import { GameContext } from "../../Contexts";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import ModeBody from "./ModeBody";

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

  // helper functions
  const { capitalize } = FrontendHelper();

  // simple function that handles the radio button change
  const handleChange = (e) => {
    const category = e.target.value;
    setSelectedRadioBtn(category);
    navigate(`/games/${ abb }/${ category }`);
  };

  /* ===== GAME COMPONENT ===== */
  return (
    <div className="game">
      <div className="game-info">
        <div className="game-rules">
          <h2>Rules</h2>
          <ol>
            <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo, quisquam veniam ipsam nulla ullam sint quam explicabo dolores labore, tempora perspiciatis quos delectus facere sapiente?</li>
            <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Et, ullam dolore eum voluptates maiores ad!</li>
            <li>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quisquam vel alias ratione beatae molestias recusandae omnis, cum voluptates numquam delectus, voluptatum odit deserunt aliquid enim? Accusantium facere nihil deleniti iure!</li>
          </ol>
        </div>
        <div className="game-recent-submissions">
          <h2>Recent Submissions</h2>
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
  );
};

/* ===== EXPORTS ===== */
export default Game;