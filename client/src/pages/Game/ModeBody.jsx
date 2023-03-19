/* ===== IMPORTS ===== */
import "./Game.css";
import { StaticCacheContext } from "../../Contexts";
import { useContext, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardButton from "../../components/LevelboardButton/LevelboardButton";

function ModeBody({ abb, category, modeName }) {
  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== VARIABLES ===== */
  const TABLE_WIDTH = 3;
  const misc = category === "misc" ? true : false;
  const game = staticCache.games.find(row => row.abb === abb);
  const mode = game.mode.find(row => row.misc === misc && row.name === modeName);

  /* ===== STATES ===== */
  const [show, setShow] = useState(false);

  /* ===== FUNCTIONS ===== */
    
  // helper functions
  const { cleanLevelName } = FrontendHelper();

  /* ===== MODEBODY COMPONENT ===== */
  return (
    // the following is a table body. the table body will always render a row that shows the name of the mode
    // however, if the user clicks on the mode row, it will toggle between an expanded and unexpanded state
    <tbody>

      { /* Mode Row - Always will render, and is clickable. If a user clicks on it, toggle between expanded and unexpanded. */ }
      <tr onClick={ () => setShow(!show) } className="game-mode-name">
        <td colSpan={ TABLE_WIDTH }><h3>{ cleanLevelName(mode.name) }</h3></td>
      </tr>

      { /* Additional rows will only be rendered if the show state is set to true. */ }
      { show &&

        // If the show state is set to true, we want to display a row for each stage.
        mode.level.map(level => {
          return (

            // Game Level Table Row - Consists of 3 elements: the level name, a button for score chart (optional), and a 
            // button for time chart (optional)
            <tr key={ level.name } className="game-level">

              { /* The first element in the row will be the name of the level. */ }
              <td className="game-level-name">
                <p>{ cleanLevelName(level.name) }</p>
              </td>

              { /* The second element in the row will depend on the chart_type of the level. If it is a score or both
              chart, we want to render a button that will allow the user to navigate to the corresponding level score chart.
              However, if it is a time chart, an empty table element will be rendered. */ }
              <td>
                { (level.chart_type === "both" || level.chart_type === "score") &&
                  <LevelboardButton abb={ game.abb } category={ category } type={ "score" } levelName={ level.name } />
                }
              </td>

              { /* The third element in the row will depend on the chart_type of the level. If it is a time or both
              chart, we want to render a button that will allow the user to navigate to the corresponding level time chart.
              However, if it is a score chart, an empty table element will be rendered. */ }
              <td>
                { (level.chart_type === "both" || level.chart_type === "time") &&
                  <LevelboardButton abb={ game.abb } category={ category } type={ "time" } levelName={ level.name } />
                }
              </td>

            </tr>
          );
        })
      }
    </tbody>
  );
};

/* ===== EXPORTS ===== */
export default ModeBody;