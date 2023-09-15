/* ===== IMPORTS ===== */
import "./GameSelect.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BoxArt from "../../components/BoxArt/BoxArt.jsx";
import GameSelectLogic from "./GameSelect.js";
import SearchBarInput from "../../components/SearchBarInput/SearchBarInput";
import PageControls from "../../components/PageControls/PageControls.jsx";

function GameSelect({ imageReducer }) {
  /* ===== STATES & FUNCTIONS ===== */
  const [pageNum, setPageNum] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [gameTypeFilter, setGameTypeFilter] = useState(undefined);

  // states & functions from the js file
  const { games, updateResults } = GameSelectLogic();

  /* ===== VARIABLES ===== */
  const BOX_WIDTH = 200;
  const GAMES_PER_PAGE = 20;
  const filters = [
    { name: "Both", value: undefined }, 
    { name: "Main Games", value: "main" }, 
    { name: "Custom Games", value: "custom" }
  ];
  let gameTypes = [];
  games.data.forEach(game => {
    const gameType = game.custom ? "Custom" : "Main";
    if (!(gameTypes.includes(gameType))) {
      gameTypes.push(gameType);
    }
  });

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts OR when user makes changes pages AND/OR makes a change to the search bar
  useEffect(() => {
    updateResults(searchInput, GAMES_PER_PAGE, pageNum, gameTypeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum]);

  // code that is executed when the component mounts OR when users makes a change to searchInput OR gameTypeFilter
  useEffect(() => {
    if (pageNum === 1) {
      updateResults(searchInput, GAMES_PER_PAGE, pageNum, gameTypeFilter);
    } else {
      setPageNum(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, gameTypeFilter]);

  /* ===== GAME SELECT COMPONENT ===== */
  return (
    <div className="game-select">

      { /* Page Header - render the name of the page, and game select filters */ }
      <div className="game-select-header">
        <h1>Games</h1>
        <div className="game-select-filters">

          { /* Render a search bar input for games */ }
          <SearchBarInput itemType={ "Games" } input={ searchInput } setInput={ setSearchInput } width={ "75%" } />

          { /* Render buttons to allow user to filter games by their type */ }
          <div className="game-select-filter-btns">
            { filters.map(filter => {
              return (
                <button 
                  className={ `game-select-filter-btn${ gameTypeFilter === filter.value ? " game-select-filter-btn-selected" : "" }` }
                  onClick={ () => setGameTypeFilter(filter.value) }
                  key={ filter.name }
                >
                  { filter.name }
                </button>
              );
            })}
          </div>

        </div>
      </div>    

      { /* Render a game select menu for each game type. */ }
      { gameTypes.map(type => {
        return (
          <div key={ type } className="game-select-body">
            <h2>{ type } Games</h2>
            <div className="game-select-cards">

              { /* Filter and map the game types to the screen as a card. */ }
              { games.data.filter(game => type === "Custom" ? game.custom : !game.custom).map(game => (
                <div className="game-select-card" key={ game.abb }>
                  <Link to={ { pathname: `/games/${ game.abb }` } }>
                    <BoxArt game={ game } imageReducer={ imageReducer } width={ BOX_WIDTH } />
                    <p>{ game.name } </p>
                  </Link>
                </div>
              ))}

            </div>
          </div>
      )})}

      { /* Render page controls at the bottom of this container */ }
      <PageControls 
        totalItems={ games.total }
        itemsPerPage={ GAMES_PER_PAGE }
        pageNum={ pageNum }
        setPageNum={ setPageNum }
        itemName={ "Games" }
      />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameSelect;