/* ===== IMPORTS ===== */
import { StaticCacheContext } from "../../utils/Contexts";
import { useContext } from "react";
import BoxArt from "../BoxArt/BoxArt.jsx";
import GameHelper from "../../helper/GameHelper";
import UserStatsCategory from "./UserStatsCategory";

function UserStatsDirectory({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const TABLE_WIDTH = 3;

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { hasMiscCategory } = GameHelper();

  /* ===== USER STATS DIRECTORY COMPONENT ===== */
  return (
    <div className="user-layout-stats">
      { /* Title */ }
      <h1>View Player Stats</h1>

      { /* Render two separate stat select menus: one for main games, and one for custom games. */ }
      { ["Main", "Custom"].map(type => {
        return (
          <table key={ type }>

            { /* Table header will simply specify the type of games. */ }
            <thead>
              <tr>
                <th colSpan={ TABLE_WIDTH }>
                  <h2>{ type } Games</h2>
                </th>
              </tr>
            </thead>

            { /* Table body will render a dynamic number of rows, depending on the number of { type } games. */ }
            <tbody>
              { staticCache.games.filter(game => type === "Custom" ? game.custom : !game.custom).map(game => {
                return (
                  // Each row contains: a game and it's box art, a link to main stats, and a link to misc stats 
                  // (ONLY render misc stats links if the game has any misc charts!)
                  <tr key={ game.name }>
                    <td>

                      { /* First, render the game and it's box art. */ }
                      <div className="user-layout-game-element">
                        <BoxArt game={ game } imageReducer={ imageReducer } width={ 75 } />
                        <span>{ game.name }</span>
                      </div>
                    </td>

                    { /* Next, access to the main score & time stats */ }
                    <td><UserStatsCategory game={ game } category={ "main" } /></td>

                    { /* Finally, access to the misc score & time stats, if the game has misc category */ }
                    { hasMiscCategory(game) && <td><UserStatsCategory game={ game } category={ "misc" } /></td> }

                  </tr>
                );
              })}
            </tbody>

          </table>
        );
      })}
    </div> 
  );
};

/* ===== EXPORTS ===== */
export default UserStatsDirectory;