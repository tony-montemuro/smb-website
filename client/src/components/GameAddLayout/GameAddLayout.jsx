/* ===== IMPORTS ===== */
import { AppDataContext, GameAddContext } from "../../utils/Contexts";
import { Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AddGamePages from "./AddGamePages.jsx";
import GameAddLayoutLogic from "./GameAddLayout.js";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Loading from "../Loading/Loading.jsx";
import styles from "./GameAddLayout.module.css";

function GameAddLayout() {
  /* ===== VARIABLES ===== */
  const pageInit = {
    number: 1,
    unlocked: [1]
  };
  const assetsData = {
    boxArt: {
      dimensions: {
        MAX_WIDTH: 256,
        MAX_HEIGHT: 363
      },
      fileTypes: ["png"],
      key: "BOX_ART"
    }
  };
  
  /* ===== CONTEXTS ===== */

  // app data state from app data context
  const { appData } = useContext(AppDataContext);

  /* ===== STATES ===== */
  const [page, setPage] = useState(pageInit); 
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [entitiesData, setEntitiesData] = useState(undefined);
  const [structureData, setStructureData] = useState(undefined);

  /* ===== FUNCTIONS ===== */
  const { 
    pageNames, 
    keys, 
    switchPages, 
    restoreUnlockedPagesState, 
    unlockNextPage,
    fetchEntitiesData,
    fetchStructureData,
    updateStructureCategories,
    resetForm
  } = GameAddLayoutLogic(page, setPage, pageInit, setEntitiesData, setStructureData);

  /* ===== CONTEXT DATA ===== */
  const contextData = {
    assetsData,
    unlockNextPage,
    keys,
    entitiesData,
    fetchEntitiesData,
    structureData,
    updateStructureCategories,
    resetForm
  }

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts AND when `appData` is changed
  useEffect(() => {
    restoreUnlockedPagesState();

    // code that executes when `appData` state is set
    if (appData) {
      fetchEntitiesData();
      fetchStructureData();
      setIsComponentMounted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appData]);

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
      <div className={ styles.disclaimer }>
        <div className={ styles.disclaimerMsg }>
          <InfoOutlinedIcon />
          <strong>Important: Your progress is saved locally.</strong>
        </div>
        <span>To ensure you don't lose your progress, please avoid:</span>
        <ul>
          <li>Clearing your browser cache or data</li>
          <li>Using private/incognito mode</li>
          <li>If you have clearing browser data on exit enabled, do not close the browser</li>
        </ul>
      </div>
      
      { appData ? 
        <GameAddContext.Provider value={ contextData }>
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