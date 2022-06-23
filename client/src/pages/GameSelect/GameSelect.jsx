import React from "react";
import "./gameselect.css";
import GameSelectInit from "./GameSelectInit";
import { useEffect } from 'react';
import GameCard from "../../components/GameCard/GameCard";

function Games() {
  const { gameList, getGames } = GameSelectInit();
  useEffect(() => {
    getGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="game-select-title">
        <h1>Select a Game</h1>
      </div>
      <div className="card-container">
        {gameList.map((val) => {
          return <GameCard name={val.name} abb={val.abb} key={val.abb} />
        })}
      </div>
    </div>
    
    
  );
};

export default Games;
