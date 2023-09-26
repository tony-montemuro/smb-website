/* ===== IMPORTS ===== */
import "./GameSearch.css";
import { useEffect, useState } from "react";
import GameRow from "../GameRow/GameRow";
import GameSearchLogic from "./GameSearch.js";
import PageControls from "../PageControls/PageControls.jsx";
import SearchBarInput from "../SearchBarInput/SearchBarInput";

function GameSearch({ gamesPerPage, searchBarWidth = "75%", imageReducer, gameRowOptions }) {
  /* ===== STATES & FUNCTIONS ===== */
  const [gameTypeFilter, setGameTypeFilter] = useState("")
  const [pageNum, setPageNum] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  // states and functions from the js file
  const { games, updateResults } = GameSearchLogic();

  /* ===== VARIABLES ===== */
  const filters = [
    { name: "Both", value: undefined }, 
    { name: "Main Games", value: "main" }, 
    { name: "Custom Games", value: "custom" }
  ];
  let gameTypes = [];
  if (games.data) {
    games.data.forEach(game => {
      const gameType = game.custom ? "Custom" : "Main";
      if (!(gameTypes.includes(gameType))) {
        gameTypes.push(gameType);
      }
    });
  }

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts OR when user makes changes pages AND/OR makes a change to the search bar
  useEffect(() => {
    updateResults(searchInput, gamesPerPage, pageNum, gameTypeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum]);

  // code that is executed when the component mounts OR when users makes a change to searchbar input
  useEffect(() => {
    if (pageNum === 1) {
      updateResults(searchInput, gamesPerPage, pageNum, gameTypeFilter);
    } else {
      setPageNum(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, gameTypeFilter]);

  /* ===== GAMES SEARCH BAR COMPONENT ===== */
  return games.data &&
    <div className="game-search">

      { /* Render a container for the filter options */ }
      <div className="game-search-filters">

        { /* Search bar input for searching for games */ }
        <SearchBarInput itemType={ "game" } input={ searchInput } setInput={ setSearchInput } width={ searchBarWidth } />

        { /* Render buttons to allow user to filter games by their type */ }
        <div className="game-search-filter-btns">
          { filters.map(filter => {
            return (
              <button 
                className={ `game-search-filter-btn${ gameTypeFilter === filter.value ? " game-search-filter-btn-selected" : "" }` }
                onClick={ () => setGameTypeFilter(filter.value) }
                key={ filter.name }
              >
                { filter.name }
              </button>
            );
          })}

        </div>

      </div>

      { /* Render the game search results */ }
      <div className="game-search-results">

        { /* Render a game select menu for each game type. */ }
        { gameTypes.map(type => {
          return (
            <div key={ type } className="game-search-body">
              <h2>{ type } Games</h2>
              <div className={ gameRowOptions.useCard ? "game-search-cards" : "game-search-items" }>

                { /* Filter and map the game types to the screen as a Game Row. */ }
                { games.data.filter(game => type === "Custom" ? game.custom : !game.custom).map(game => {
                  return (
                    <GameRow
                      game={ game }
                      imageReducer={ imageReducer } 
                      useCard={ gameRowOptions.useCard } 
                      onClick={ gameRowOptions.onGameRowClick }
                      key={ game.abb }
                    />
                  );
                })}

              </div>
            </div>
        )})}

        { /* Render pagination controls */ }
        <PageControls
          totalItems={ games.total }
          itemsPerPage={ gamesPerPage }
          pageNum={ pageNum }
          setPageNum={ setPageNum }
          itemName={ "Games" } 
        />
        
      </div>
    </div>
};

/* ===== EXPORTS ===== */
export default GameSearch;