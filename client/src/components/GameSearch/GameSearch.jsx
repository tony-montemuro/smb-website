/* ===== IMPORTS ===== */
import { useEffect, useState } from "react";
import styles from "./GameSearch.module.css";
import ButtonList from "../ButtonList/ButtonList.jsx";
import GameRow from "../GameRow/GameRow";
import GameSearchLogic from "./GameSearch.js";
import Items from "../Items/Items.jsx";
import Loading from "../Loading/Loading.jsx";
import PageControls from "../PageControls/PageControls.jsx";
import SearchBarInput from "../SearchBarInput/SearchBarInput";

function GameSearch({ gamesPerPage, imageReducer, gameRowOptions }) {
  /* ===== STATES & FUNCTIONS ===== */
  const [gameTypeFilter, setGameTypeFilter] = useState(undefined)
  const [pageNum, setPageNum] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  // states and functions from the js file
  const { games, updateResults } = GameSearchLogic();

  /* ===== VARIABLES ===== */
  const buttons = [
    { name: "Both", value: undefined },
    { name: "Main Games", value: "main" },
    { name: "Custom Games", value: "custom" }
  ];
  let gameTypes = undefined;
  if (games.data) {
    gameTypes = [];
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
  return (
    <div className={ styles.gameSearch }>

      { /* Filters - render the various filters to game search, including the search bar, and buttons to filter by type */ }
      <div className={ styles.filters }>
        <SearchBarInput itemType={ "game" } input={ searchInput } setInput={ setSearchInput } />
        <ButtonList buttons={ buttons } current={ gameTypeFilter } setCurrent={ setGameTypeFilter } />
      </div>

      { /* Search results - render the game search results here for main and/or custom games */ }
      { gameTypes ?
        <Items items={ gameTypes } emptyMessage={ "No games exist that match your filters." }>
          { gameTypes.map(type => {
            return (
              <div key={ type } className={ styles.body }>
                <h2>{ type } Games</h2>
                <div className={ gameRowOptions.useCard ? styles.cards : "" }>
                  { games.data.filter(game => type === "Custom" ? game.custom : !game.custom).map((game, index) => {
                    return (
                      <GameRow
                        game={ game }
                        imageReducer={ imageReducer } 
                        useCard={ gameRowOptions.useCard } 
                        onClick={ gameRowOptions.onGameRowClick }
                        index={ index }
                        key={ game.abb }
                      />
                    );
                  })}
                </div>
              </div>
          )})}
        </Items>
      :
        <Loading />
      }

      { /* Pagination controls - Render controls for search results */ }
      <PageControls
        totalItems={ games.total }
        itemsPerPage={ gamesPerPage }
        pageNum={ pageNum }
        setPageNum={ setPageNum }
        itemName={ "Games" } 
      />

    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameSearch;