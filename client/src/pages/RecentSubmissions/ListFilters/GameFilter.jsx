/* ===== IMPORTS ===== */
import { useEffect } from "react";
import styles from "./ListFilters.module.css";
import GameFilterLogic from "./GameFilter.js";
import GameSearch from "../../../components/GameSearch/GameSearch.jsx";
import GameRow from "../../../components/GameRow/GameRow.jsx";
import Items from "../../../components/Items/Items.jsx";
import Loading from "../../../components/Loading/Loading.jsx";

function GameFilter({ searchParams, setSearchParams, imageReducer, globalGames, updateGlobalGames }) {
  /* ===== FUNCTIONS ===== */
  
  // functions from the js file
  const { 
    games,
    versions,
    syncGames,
    addGame,
    removeGame,
    resetFilter,
    updateVersion,
    closePopupAndUpdate
  } = GameFilterLogic(updateGlobalGames);
  console.log(versions);

  /* ===== VARIABLES ===== */
  const GAMES_PER_PAGE = 20;
  const gameRowOptions = {
    useCard: false,
    onGameRowClick: addGame
  };

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    syncGames(globalGames);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== GAME FILTER COMPONENT ===== */
  return (
    <div className={ styles.filter }>

      { /* Render name of the popup */ }
      <div className={ styles.section }>
        <h1>Filter By Game</h1>
      </div>

      <hr />

      { games ?
        <>

          {/* Next, render the set of all games that the user wants / has already has filtered */}
          <div className={ styles.section }>
            <h2>Filtered Games</h2>
            <p>Click a game to remove it as a filter.</p>
            <Items items={ games } emptyMessage="You are not currently filtering by any games.">
              { games.map((game, index) => {
                  return (
                    <GameRow
                      game={ game }
                      imageReducer={ imageReducer }
                      onClick={ removeGame }
                      index={ index }
                      key={ game.abb }
                      versionsData={{
                        version: versions[game.abb],
                        versions: game.version,
                        onChange: updateVersion
                      }}
                    />
                  );
                })}
            </Items>
            <div className={ styles.btns }>
              <button type="button" className="cancel" onClick={ resetFilter }>Reset Filter</button>
              <button type="button" onClick={ () => closePopupAndUpdate(searchParams, setSearchParams) }>
                Apply Filters
              </button>
            </div>
          </div>
    
          <hr />
    
          { /* Render a game search component to select a game to filter by */ }
          <div className={ styles.section }>
            <h2>Add Games</h2>
            <p>Click a game to add it as a filter.</p>
          </div>
          <GameSearch 
            gamesPerPage={ GAMES_PER_PAGE }
            imageReducer={ imageReducer }
            gameRowOptions={ gameRowOptions }
          />

        </>
      :
        <Loading />
      }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameFilter;