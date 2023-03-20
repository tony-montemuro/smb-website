/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import { StaticCacheContext } from "../../Contexts";
import { useContext } from "react";

function UserStatsDirectory() {
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
                <th colSpan={ 3 }>{ type } Games</th>
              </tr>
            </thead>

            { /* Table body will render a dynamic number of rows, depending on the number of { type } games. */ }
            <tbody>
              { staticCache.games.filter(game => type === "Custom" ? game.custom : !game.custom).map(game => {
                return (
                  // Each row contains: the name of the game, a link to main stats, and a link to misc stats
                  <tr key={ game.name }>
                    <td>{ game.name }</td>
                    <td><Link className="user-stats-link" to={ `${ game.abb }/main` }>Main</Link></td>
                    <td><Link className="user-stats-link" to={ `${ game.abb }/misc` }>Misc</Link></td>
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