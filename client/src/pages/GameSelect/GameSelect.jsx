import "./gameselect.css";
import React, { useEffect } from "react";
import GameSelectInit from "./GameSelectInit";
import FrontendHelper from "../../helper/FrontendHelper";
import GameCard from "../../components/GameCard/GameCard";

function Games({ games }) {
  // states and functions from init file
  const { loading, gameLists, splitGameList } = GameSelectInit();

  // helper functions
  const { capitalize } = FrontendHelper();

  // code that is executed when the page loads, or when the games state is changed
  useEffect(() => {
    if (games) {
      splitGameList(games);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games]);

  // game select component
  return (
    <>
      <h1>Select a Game</h1>
      { Object.keys(gameLists).map(type => {
        return (
          <div key={ type } className="game-select">
            <h2>{ capitalize(type) } Games</h2>
            { loading ?
              <p>Loading...</p>
            :
            <div className="game-select-cards">
              {gameLists[type].map(game => {
                return <GameCard key={ game.abb } game={ { name: game.name, abb: game.abb } } />;
              })}
            </div>
            }
          </div>
        );
      })}
    </>
  );
};

export default Games;
