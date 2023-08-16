/* ===== IMPORTS ===== */
import { StaticCacheContext } from "../../utils/Contexts";
import { useContext, useEffect } from "react";
import BoxArt from "../BoxArt/BoxArt.jsx";
import GameHelper from "../../helper/GameHelper";
import FrontendHelper from "../../helper/FrontendHelper";
import UserStatsCategory from "./UserStatsCategory";
import UserStatsDirectoryLogic from "./UserStatsDirectory.js";

function UserStatsDirectory({ imageReducer, profile }) {
  /* ===== VARIABLES ===== */
  const TABLE_WIDTH = 3;

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { userGames, initUserGames } = UserStatsDirectoryLogic();

  // helper functions
  const { getGameCategories } = GameHelper();
  const { capitalize } = FrontendHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component first mounts
  useEffect(() => {
    initUserGames(staticCache.games, profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== USER STATS DIRECTORY COMPONENT ===== */
  return userGames &&
    <div className="user-layout-stats">
      
      { /* Title */ }
      <h1>View Player Statistics</h1>

      { /* Render stats select menus if the user has any main or custom games they have submitted to. */ }
      { userGames.main || userGames.custom ?

        // Render a stat select menu for each key of the object
        Object.keys(userGames).map(type => {
          return (
            <table key={ type }>
  
              { /* Table header will simply specify the type of games. */ }
              <thead>
                <tr>
                  <th colSpan={ TABLE_WIDTH }>
                    <h2>{ capitalize(type) } Games</h2>
                  </th>
                </tr>
              </thead>
  
              { /* Table body will render a dynamic number of rows, depending on the number of { type } userGames. */ }
              <tbody>
                { userGames[type].map(game => {
                  return (
                    // Each row contains: a game, it's box art, and links to stats for each game category
                    <tr key={ game.name }>
                      <td>
  
                        { /* First, render the game and it's box art. */ }
                        <div className="user-layout-game-element">
                          <BoxArt game={ game } imageReducer={ imageReducer } width={ 75 } />
                          <span>{ game.name }</span>
                        </div>
                      </td>
  
                      { /* Now, render the user stats category component for each game's category */ }
                      { getGameCategories(game).map(category => {
                        return <td><UserStatsCategory game={ game } category={ category } /></td>
                      })}
  
                    </tr>
                  );
                })}
              </tbody>
  
            </table>
          );
        })
      :

        // Otherwise, render a message letting the user know that this user has no submissions.
        <span>This user has no submissions to any game.</span>
      }

    </div> 
};

/* ===== EXPORTS ===== */
export default UserStatsDirectory;