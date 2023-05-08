/* ===== IMPORTS ===== */
import "./Game.css";
import { GameContext } from "../../Contexts";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
    <>
      { /* Game Header - this div renders general information related to the game */ }
      <div className="game-header">

        { /* Two radio buttons to toggle between two category modes: main and misc. */ }
        <div className="game-radio-buttons">
          {[{ name: "main", alias: "Main" }, { name: "misc", alias: "Miscellaneous" }].map(category => {
            return (
              <div key={ category.name } className={ `game-${ category.name }-btn` }>
                <label htmlFor={ category.name }>{ category.alias } Charts:</label>
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

      </div>

      { /* Game Body - This div includes the level list, as well as links to game boards. */ }
      <div className="game-body">

        { /* Game Level List - Specifies the category of levels, and renders a list of levels to select. */ }
        <div className="game-level-list">
          <h2>{ capitalize(selectedRadioBtn) } Levels</h2>
          <table>
            { game.mode.filter(mode => selectedRadioBtn === "misc" ? mode.misc : !mode.misc).map(mode => {
              return <ModeBody category={ selectedRadioBtn } modeName={ mode.name } key={ `${ selectedRadioBtn }_${ mode.name }` } />;
            })}
          </table>
        </div>

        {/* Game Boards */}
        <div className="game-boards">

          { /* This map function will render both a link to the time & score world record boards. */ }
          { ["score" ,"time"].map(type => {
            return (
              <div key={ type } className={ `game-${ type }-wrs` }>
                <h2>{ capitalize(type) } World Records</h2>
                <Link to={ `/games/${ game.abb }/${ selectedRadioBtn }/${ type }` }>
                  <p>{ selectedRadioBtn === "misc" ? capitalize(selectedRadioBtn) : null } { capitalize(type) } World Records</p>
                </Link>
              </div>
            );
          })}

          { /* This map function will render both a link to the medal table and totalizer boards. */ }
          { [{ name: "medals", alias: "Medal Tables" }, { name: "totalizer", alias: "Totalizers" }].map(boardType => {
            return (
              <div key={ boardType.name } className={ `game-${ boardType.name }` }>
                <h2> { boardType.alias } </h2>
                <Link to={ `/games/${ game.abb }/${ selectedRadioBtn }/${ boardType.name }` }>
                  <p>{ selectedRadioBtn === "misc" ? capitalize(selectedRadioBtn) : null } Score & Time { boardType.alias }</p>
                </Link>
              </div>
            );
          })}

        </div>
      </div>
    </>
  );
};

/* ===== EXPORTS ===== */
export default Game;