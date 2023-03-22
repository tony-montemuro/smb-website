/* ===== IMPORTS ===== */
import "./Game.css"
import { Link, useLocation, useNavigate } from "react-router-dom";
import { StaticCacheContext } from "../../Contexts";
import { useContext, useEffect, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import ModeBody from "./ModeBody";
import SearchBar from "../../components/SearchBar/SearchBar.jsx";

function Game() {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES AND FUNCTIONS ===== */
  const [selectedRadioBtn, setSelectedRadioBtn] = useState(category ? category : "main");
  const [game, setGame] = useState(undefined);

  // helper functions
  const { capitalize } = FrontendHelper();

  // simple function that handles the radio button change
  const handleChange = (e) => {
    const category = e.target.value;
    setSelectedRadioBtn(category);
    navigate(`/games/${ abb }/${ category }`);
  };

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, or when the staticCache object is updated
  useEffect(() => {
    if (staticCache.games.length > 0) {
      // see if abb corresponds to a game stored in cache
      const games = staticCache.games;
      const game = games.find(row => row.abb === abb);

      // if not, we will print an error message, and navigate to the home screen
      if (!game) {
        console.log("Error: Invalid game.");
        navigate("/");
        return;
      }

      // update the game state hook, and fetch the totals
      setGame(game);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache]);

  /* ===== GAME COMPONENT ===== */
  return (
    <>
      { /* If the game data has been loaded, we can render the game's information to the client. Otherwise,
      render a loading component. */ }
      { game ?
        <>

          {/* SearchBar component - used to search through the list of levels corresponding to game */}
          <div className="game-searchbar">
            <SearchBar abb={ abb } />
          </div>

          { /* Game Header - this div renders general information related to the game */ }
          <div className="game-header">

            {/* Title of the game */}
            <h1>{ game.name }</h1>

            {/* Link back to the game select page */}
            <Link to={ `/games` }>
              <button>Back to Game Select</button>
            </Link>

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
                  return <ModeBody abb={ abb } category={ selectedRadioBtn } modeName={ mode.name } key={ `${ selectedRadioBtn }_${ mode.name }` } />;
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
      :
        // Loading component
        <p>Loading...</p>
      }
    </>
  );
};

/* ===== EXPORTS ===== */
export default Game;