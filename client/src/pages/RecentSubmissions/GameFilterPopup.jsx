/* ===== IMPORTS ===== */
import { useEffect } from "react";
import GameFilterPopupLogic from "./GameFilterPopup.js";
import GameSearch from "../../components/GameSearch/GameSearch.jsx";
import GameRow from "../../components/GameRow/GameRow.jsx";

function GameFilterPopup({ popup, setPopup, searchParams, setSearchParams, imageReducer }) {
  /* ===== STATES & FUNCTIONS ===== */
  
  // state and functions from the js file
  const { games, fetchGames, addGame, removeGame, closePopup, closePopupAndUpdate } = GameFilterPopupLogic();

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
  return popup &&
    <div className="recent-submissions-popup">
      <div className="recent-submissions-popup-inner">

        { /* Render button to close the popup */ }
        <div className="recent-submissions-popup-close-btn">
          <button onClick={ () => closePopup(setPopup) }>Close</button>
        </div>

        { /* Render the name of the popup */ }
        <h1>Filter By Game</h1>

        <div className="recent-submissions-popup-selected">
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
                      />
                    );
                  })}

                </div>
              :
                // Otherwise, let the user know that they have not selected any games to filter by
                <i id="recent-submissions-popup-empty">You are not currently filtering by any games.</i>
              }

              { /* Render a button that allows user to update the filters */ }
              <button 
                onClick={ () => closePopupAndUpdate(setPopup, searchParams, setSearchParams) }
                id="recent-submissions-popup-selected-btn"
              >
                Update Filters
              </button>
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
    </div>;
};

/* ===== EXPORTS ===== */
export default GameFilterPopup;