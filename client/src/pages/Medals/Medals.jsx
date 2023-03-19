/* ===== IMPORTS ===== */
import "./Medals.css";
import { Link } from "react-router-dom";
import { StaticCacheContext } from "../../Contexts";
import { useContext, useEffect } from "react";
import MedalsLogic from "./Medals.js";
import MedalTable from "./MedalTable";

function Medals({ submissionReducer, imageReducer }) {
  /* ===== VARIABLES ===== */
  const path = window.location.pathname;
  const abb = path.split("/")[2];
  const category = path.split("/")[3];
  const isMisc = category === "misc" ? true : false;

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES AND FUNCTIONS ===== */

  // states and functions from the js file
  const { 
    game,
    medals,
    fetchGame,
    fetchMedals
  } = MedalsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, or when the staticCache object is updated
  useEffect(() => {
    if (staticCache.games.length > 0) {
      if (fetchGame(abb)) {
        fetchMedals(abb, category, submissionReducer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache]);
      
  /* ===== MEDALS COMPONENT ===== */
  return game && medals ?
    // Medals Header - Displays the name of the game, as well as buttons to navigate to related pages.
    <>
      <div className="medals-header">

        { /* Game Title */ }
        <h1>{ isMisc && "Miscellaneous" } { game.name } Medal Table</h1>

        { /* Return to game page button */ }
        <Link to={ `/games/${ game.abb }` }>
          <button>Back to { game.name }'s Page</button>
        </Link>

        { /* Game totalizer page button */ }
        <Link to={ `/games/${ game.abb }/${ category }/totalizer` }>
          <button> { isMisc && "Miscellaneous" } { game.name }'s Totalizer Page</button>
        </Link>

      </div>

      { /*  Medals Body - Render both the score and time medal tables. */ }
      <div className="medals-body">
        { Object.keys(medals).map(type => {
          return <MedalTable medals={ medals } type={ type } imageReducer={ imageReducer } key={ type } />
        })}
      </div>

    </>
  :
    // Loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default Medals;