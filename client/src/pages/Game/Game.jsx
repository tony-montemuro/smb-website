import "./game.css"
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import GameInit from "./GameInit";
import ModeTab from "./ModeTab";

function Game() {
  // radio button state
  const [selectedRadioBtn, setSelectedRadioBtn] = useState("main");

  // states and functions from the init file
  const { loading, game, levels, getLevels } = GameInit();

  // helper functions
  const { capitalize } = FrontendHelper();

  // code that executed when the page is first loaded. get all levels categorized by mode
  // also checks to make sure the pathing is valid
  useEffect(() => {
    getLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // game component
  return (
    <>
      <div className="game-header">
        <Link to={ `/games` }>
          <button>Back to Game Select</button>
        </Link>
        <h1>{ game.name }</h1>
      </div>
      { loading ? 
        <p>Loading...</p>
        :
        <div className="game-body">
          <div className="game-level-list">
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
                    <p>{ capitalize(selectedRadioBtn) } { capitalize(type) } World Records</p>
                  </Link>
                </div>
              );
            })}
            { [{ name: "medals", alias: "Medal Tables" }, { name: "totalizer", alias: "Totalizers" }].map(boardType => {
              return (
                <div key={ boardType.name } className={ `game-${ boardType.name }` }>
                  <h2> { boardType.alias } </h2>
                  <Link to={ { pathname: `/games/${ game.abb }/${ selectedRadioBtn }/${ boardType.name }` } }>
                    <p>Score & Time { boardType.alias }</p>
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