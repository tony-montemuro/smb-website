import React from "react";
import "./gameselect.css";
import GameSelectInit from "./GameSelectInit";
import { useEffect } from 'react';
import GameCard from "../../components/GameCard/GameCard";

function Games() {
  const { gameList, customGameList, getGames } = GameSelectInit();
  useEffect(() => {
    getGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="game-select-title">
        <h1>Select a Game</h1>
      </div>
      <h2>Main Games</h2>
      <div className="card-container">
        {gameList.map((val) => {
          return <GameCard name={val.name} abb={val.abb} key={val.abb} />
        })}
      </div>
      <h2>Custom Levels</h2>
      <div className="card-container">
        {customGameList.map((val) => {
          return <GameCard name={val.name} abb={val.abb} key={val.abb} />
        })}
      </div>
    </div>
    
    
  );
};

export default Games;
