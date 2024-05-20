/* ===== IMPORTS ===== */
import { GameAddContext } from "../../utils/Contexts";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import GameAddLayoutLogic from "./GameAddLayout.js";
import styles from "./GameAddLayout.module.css";

function GameAddLayout() {
  /* ===== VARIABLES ===== */
  const keys = {
    metadata: "GAME_ADD_METADATA",
    unlockedPages: "GAME_ADD_UNLOCKED_PAGES"
  };

  /* ===== STATES ===== */
  const [pageNumber, setPageNumber] = useState(1); 
  const [unlockedPages, setUnlockedPages] = useState([1]);

  /* ===== FUNCTIONS ===== */
  const { restoreUnlockedPagesState, unlockNextPage } = GameAddLayoutLogic(keys, pageNumber, unlockedPages, setUnlockedPages); 

  /* ===== EFFECTS ===== */
  useEffect(() => {
    restoreUnlockedPagesState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== GAME ADD LAYOUT ===== */
  return (
    <div className={ styles.gameAdd }>
      <h1>Add Game</h1>
      <GameAddContext.Provider value={ { unlockNextPage, keys } }>
        <Outlet />
      </GameAddContext.Provider>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameAddLayout;