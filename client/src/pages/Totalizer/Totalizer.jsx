/* ===== IMPORTS ===== */
import "./Totalizer.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { StaticCacheContext } from "../../Contexts";
import { useContext, useEffect, useState } from "react";
import TotalizerLogic from "./Totalizer.js";
import TotalizerTable from "./TotalizerTable";

function Totalizer({ imageReducer, submissionReducer }) {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const abb = path.split("/")[2];
  const category = path.split("/")[3];
  const isMisc = category === "misc" ? true : false;

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES AND FUNCTIONS ===== */
  const [game, setGame] = useState(undefined);

  // states and functions from the js file
  const {
    totals,
    fetchTotals
  } = TotalizerLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, when the staticCache object is updated, or when the user
  // switches between miscellaneous and main
  useEffect(() => {
    if (staticCache.games.length > 0) {
      // see if abb corresponds to a game stored in cache
      const games = staticCache.games;
      const game = games.find(row => row.abb === abb);

      // if not, we will print an error message, and navigate to the home screen
      if (!game) {
        console.log("Error: Invalid game.");
        navigate("/");
        return;
      }

      // update the game state hook, and fetch the totals
      setGame(game);
      fetchTotals(game, category, submissionReducer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache, location.pathname]);

  /* ===== TOTALIZER COMPONENT ===== */
  return game && totals ? 
    <>
      <div className="totalizer-header">

        { /* Game Title */ }
        <h1>{ isMisc && "Miscellaneous" } { game.name } Totalizer</h1>

        { /* Return to game page button */ }
        <Link to={ `/games/${ game.abb }` }>
          <button>Back to { game.name }'s Page</button>
        </Link>

        { /* The other category's totalizer page button */ }
        <Link to={ `/games/${ game.abb }/${ isMisc ? "main" : "misc" }/totalizer` }>
          <button> { !isMisc && "Miscellaneous" } { game.name }'s Totalizer Page</button>
        </Link>

        { /* Game medal table page button */ }
        <Link to={ `/games/${ game.abb }/${ isMisc ? "misc" : "main" }/medals` }>
          <button>{ isMisc && "Miscellaneous" } { game.name }'s Medal Table Page</button>
        </Link>

      </div>

      { /* Totalizer Body - Render both the score and time totalizer tables. */ }
      <div className="totalizer-body">
        { Object.keys(totals).map(type => {
          return <TotalizerTable type={ type } totals={ totals[type] } imageReducer={ imageReducer } key={ type }/>
        })}
      </div>

    </>
  :
    // Loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default Totalizer;