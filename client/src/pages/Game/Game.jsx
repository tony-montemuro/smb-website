import "./game.css"
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import GameInit from "./GameInit";
import ModeTab from "./ModeTab";
import SearchBar from "../../components/SearchBar/SearchBar";

function Game({ cache }) {
  // radio button state
  const [selectedRadioBtn, setSelectedRadioBtn] = useState("main");

  // states and functions from the init file
  const { loading, game, levels, splitLevels } = GameInit();

  // helper functions
  const { capitalize } = FrontendHelper();

  // code that is executed when the page loads, or when the games or levels state is updated
  useEffect(() => {
    if (cache.games && cache.levels) {
      splitLevels(cache.games, cache.levels);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cache.games, cache.levels]);

  // game component
  return (
    <>
      { loading ? null : <div className="game-searchbar"><SearchBar game={ game.abb } levels={ cache.levels.filter(e => e.game === game.abb) } /></div> }
      <div className="game-header">
        <h1>{ game.name }</h1>
        <Link to={ `/games` }>
          <button>Back to Game Select</button>
        </Link>
        <div className="game-radio-buttons">
          {[{ name: "main", alias: "Main" }, { name: "misc", alias: "Miscellaneous" }].map(category => {
            return (
              <div key={ category.name } className={ `game-${ category.name }-btn` }>
                <label htmlFor={ category.name }>{ category.alias } Charts:</label>
                <input 
                  type="radio" 
                  value={ category.name }
                  checked={ selectedRadioBtn === category.name }
                  onChange={ (e) => setSelectedRadioBtn(e.target.value) }
                  disabled={ loading }>
                </input>
              </div>
            );
          })}
        </div>
      </div>
      { loading ? 
        <p>Loading...</p>
        :
        <div className="game-body">
          <div className="game-level-list">
            <h2>{ capitalize(selectedRadioBtn) } Levels</h2>
            <table>
              { Object.keys(levels[selectedRadioBtn]).map(mode => {
                return <ModeTab 
                  key={ `${ mode }_${ selectedRadioBtn }` } 
                  game={ game } mode={ mode } 
                  levels={ levels[selectedRadioBtn][mode] } 
                  category={ selectedRadioBtn } 
                />
              })}
            </table>
          </div>
          <div className="game-boards">
            { ["score" ,"time"].map(type => {
              return (
                <div key={ type } className={ `game-${ type }-wrs` }>
                  <h2>{ capitalize(type) } World Records</h2>
                  <Link to={ { pathname: `/games/${ game.abb }/${ selectedRadioBtn }/${ type }` } }>
                    <p>{ selectedRadioBtn === "misc" ? capitalize(selectedRadioBtn) : null } { capitalize(type) } World Records</p>
                  </Link>
                </div>
              );
            })}
            { [{ name: "medals", alias: "Medal Tables" }, { name: "totalizer", alias: "Totalizers" }].map(boardType => {
              return (
                <div key={ boardType.name } className={ `game-${ boardType.name }` }>
                  <h2> { boardType.alias } </h2>
                  <Link to={ { pathname: `/games/${ game.abb }/${ selectedRadioBtn }/${ boardType.name }` } }>
                    <p>{ selectedRadioBtn === "misc" ? capitalize(selectedRadioBtn) : null } Score & Time { boardType.alias }</p>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      }
    </>
  );
};

export default Game;