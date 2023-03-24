/* ===== IMPORTS ===== */
import "./User.css";
import { StaticCacheContext } from "../../Contexts";
import { useContext } from "react";
import UserStatsCategory from "./UserStatsCategory";

function UserStatsDirectory() {
  /* ===== VARIABLES ===== */
  const TABLE_WIDTH = 3;

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== USER STATS DIRECTORY COMPONENT ===== */
  return (
    <div className="user-stats-games">
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
                  // Each row contains: the name of the game, a link to main stats, and a link to misc stats
                  <tr key={ game.name }>
                    <td className="user-stats-game-element">{ game.name }</td>
                    <td><UserStatsCategory game={ game } category={ "main" } /></td>
                    <td><UserStatsCategory game={ game } category={ "misc" } /></td>
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