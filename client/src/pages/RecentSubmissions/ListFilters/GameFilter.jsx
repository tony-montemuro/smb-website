/* ===== IMPORTS ===== */
import styles from "./ListFilters.module.css";
import GameFilterLogic from "./GameFilter.js";
import GameSearch from "../../../components/GameSearch/GameSearch.jsx";
import GameRow from "../../../components/GameRow/GameRow.jsx";
import Items from "../../../components/Items/Items.jsx";
import Loading from "../../../components/Loading/Loading.jsx";

function GameFilter({ searchParams, setSearchParams, imageReducer, games, dispatchFiltersData }) {
  /* ===== FUNCTIONS ===== */
  
  // functions from the js file
  const { addGame, removeGame, resetFilter, closePopupAndUpdate } = GameFilterLogic(games, dispatchFiltersData);

  /* ===== VARIABLES ===== */
  const GAMES_PER_PAGE = 20;
  const gameRowOptions = {
    useCard: false,
    onGameRowClick: addGame
  };

  /* ===== GAME FILTER COMPONENT ===== */
  return (
    <div className={ styles.filter }>

      { /* Render name of the popup */ }
      <div className={ styles.section }>
        <h1>Filter By Game</h1>
      </div>

      <hr />

      { /* Next, render the set of all games that the user wants / has already has filtered */ }
      <div className={ styles.section }>
        <h2>Filtered Games</h2>
        <p>Click a game to remove it as a filter.</p>
        { games ?
          <>
            <Items items={ games } emptyMessage="You are not currently filtering by any games.">
              { games.map((game, index) => {
                  return (
                    <GameRow
                      game={ game }
                      imageReducer={ imageReducer }
                      useCard={ false }
                      onClick={ removeGame }
                      index={ index }
                      key={ game.abb }
                    />
                  );
                })}
            </Items>
            <div className={ styles.btns }>
              <button type="button" onClick={ resetFilter }>Reset Filter</button>
              <button type="button" onClick={ () => closePopupAndUpdate(searchParams, setSearchParams) }>
                Apply Filters
              </button>
            </div>
          </>
        :
          <Loading />
        }
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

    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameFilter;