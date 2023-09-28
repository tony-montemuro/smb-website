/* ===== IMPORTS ===== */
import { PopupContext } from "../../utils/Contexts.js";
import { useContext, useEffect } from "react";
import GameFilterLogic from "./GameFilter.js";
import GameSearch from "../../components/GameSearch/GameSearch.jsx";
import GameRow from "../../components/GameRow/GameRow.jsx";

function GameFilter({ searchParams, setSearchParams, imageReducer }) {
  /* ===== CONTEXTS ===== */

  // close popup function from popup context
  const { closePopup } = useContext(PopupContext);

  /* ===== STATES & FUNCTIONS ===== */
  
  // state and functions from the js file
  const { games, fetchGames, addGame, removeGame, resetFilter, closePopupAndUpdate } = GameFilterLogic();

  /* ===== VARIABLES ===== */
  const GAMES_PER_PAGE = 20;
  const gameRowOptions = {
    useCard: false,
    onGameRowClick: addGame
  };

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    fetchGames(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== GAME FILTER COMPONENT ===== */
  return (
    <div className="recent-submissions-game-filter">

      { /* Render the name of the popup */ }
      <h1>Filter By Game</h1>

      <div className="recent-submissions-filter-selected">
        <h2>Filtered Games</h2>
        <p>Click a game to remove it as a filter.</p>

        { /* Only render the list of games if the `games` state is defined */ }
        { games ?
          <>
            { games.length > 0 ?

              // Render a game row for each game
              <div className="recent-submissions-popup-selected-items">
                { games.map(game => {
                  return (
                    <GameRow
                      game={ game }
                      imageReducer={ imageReducer }
                      useCard={ false }
                      onClick={ removeGame }
                      key={ game.abb }
                    />
                  );
                })}

              </div>
            :
              // Otherwise, let the user know that they have not selected any games to filter by
              <i id="recent-submissions-filter-empty">You are not currently filtering by any games.</i>
            }

            { /* Render a button that allows user to reset filters, as well as apply any filters */ }
            <div className="recent-submissions-filter-submit-btns">
              <button type="button" onClick={ resetFilter }>Reset Filter</button>
              <button type="button" onClick={ () => closePopupAndUpdate(closePopup, searchParams, setSearchParams) }>
                Apply Filters
              </button>
            </div>
            
          </>

        :
          // Otherwise, render a loading component
          <p>Loading...</p>
        }

      </div>

      { /* Finally, render a game search component to select a game to filter by */ }
      <div className="game-search-add">
        <h2>Add Games</h2>
        <p>Click a game to add it as a filter.</p>
        <GameSearch 
          gamesPerPage={ GAMES_PER_PAGE }
          searchBarWidth={ "50%" }
          imageReducer={ imageReducer }
          gameRowOptions={ gameRowOptions }
        />
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameFilter;