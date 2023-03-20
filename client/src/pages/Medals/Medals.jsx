/* ===== IMPORTS ===== */
import "./Medals.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { StaticCacheContext } from "../../Contexts";
import { useContext, useEffect, useState } from "react";
import MedalsLogic from "./Medals.js";
import MedalTable from "./MedalTable";

function Medals({ submissionReducer, imageReducer }) {
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
    medals,
    fetchMedals
  } = MedalsLogic();

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

      // update the game state hook, and fetch medals
      setGame(game);
      fetchMedals(abb, category, submissionReducer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache, location.pathname]);
      
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

        { /* The other category's medal table page button */ }
        <Link to={ `/games/${ game.abb }/${ isMisc ? "main" : "misc" }/medals` }>
          <button> { !isMisc && "Miscellaneous" } { game.name }'s Medal Table Page</button>
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