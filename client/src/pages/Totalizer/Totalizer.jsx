/* ===== IMPORTS ===== */
import "./Totalizer.css";
import { GameContext } from "../../Contexts";
import { Link, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import TotalizerLogic from "./Totalizer.js";
import TotalizerTable from "./TotalizerTable";

function Totalizer({ imageReducer, submissionReducer }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname;
  const category = path.split("/")[3];
  const isMisc = category === "misc" ? true : false;

  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== STATES AND FUNCTIONS ===== */

  // states and functions from the js file
  const {
    totals,
    fetchTotals
  } = TotalizerLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts, or when the user switches between miscellaneous and main
  useEffect(() => {
    fetchTotals(game, category, submissionReducer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ===== TOTALIZER COMPONENT ===== */
  return totals ? 
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