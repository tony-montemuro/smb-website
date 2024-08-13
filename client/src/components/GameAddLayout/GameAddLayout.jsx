/* ===== IMPORTS ===== */
import { AppDataContext, GameAddContext } from "../../utils/Contexts";
import { Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AddGamePages from "./AddGamePages.jsx";
import GameAddLayoutLogic from "./GameAddLayout.js";
import Loading from "../Loading/Loading.jsx";
import styles from "./GameAddLayout.module.css";

function GameAddLayout() {
  /* ===== VARIABLES ===== */
  const pageInit = {
    number: 1,
    unlocked: [1]
  };

  /* ===== CONTEXTS ===== */

  // app data state from app data context
  const { appData } = useContext(AppDataContext);

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
      
      { appData ? 
        <GameAddContext.Provider value={ { unlockNextPage, keys } }>
          <Outlet />
          <AddGamePages 
            page={ page }
            setPage={ setPage }
            pageNames={ pageNames }  
          />
        </GameAddContext.Provider>
      :
        <Loading />
      }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameAddLayout;