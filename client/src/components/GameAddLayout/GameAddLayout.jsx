/* ===== IMPORTS ===== */
import { GameAddContext } from "../../utils/Contexts";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import AddGamePages from "./AddGamePages.jsx";
import GameAddLayoutLogic from "./GameAddLayout.js";
import styles from "./GameAddLayout.module.css";

function GameAddLayout() {
  /* ===== VARIABLES ===== */
  const pageInit = {
    number: 1,
    unlocked: [1]
  };

  /* ===== STATES ===== */
  const [page, setPage] = useState(pageInit); 
  const [isComponentMounted, setIsComponentMounted] = useState(false);

  /* ===== FUNCTIONS ===== */
  const { 
    pageNames, 
    keys, 
    switchPages, 
    restoreUnlockedPagesState, 
    unlockNextPage 
  } = GameAddLayoutLogic(page, setPage); 

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    restoreUnlockedPagesState();
    setIsComponentMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // code that is executed when the page number changes
  useEffect(() => {
    if (isComponentMounted) {
      switchPages(page.number);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.number]);

  /* ===== GAME ADD LAYOUT ===== */
  return (
    <div className={ styles.gameAdd }>
      <h1>Add Game</h1>
      <GameAddContext.Provider value={ { unlockNextPage, keys } }>
        <Outlet />
        <AddGamePages 
          page={ page }
          setPage={ setPage }
          pageNames={ pageNames }  
        />
      </GameAddContext.Provider>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameAddLayout;