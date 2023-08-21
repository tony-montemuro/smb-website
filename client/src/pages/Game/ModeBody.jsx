/* ===== IMPORTS ===== */
import "./Game.css";
import { GameContext } from "../../utils/Contexts";
import { useContext } from "react";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FrontendHelper from "../../helper/FrontendHelper";
import GameLogic from "./Game.js";
import LevelboardButton from "../../components/LevelboardButton/LevelboardButton";

function ModeBody({ category, modeName, selectedMode, setSelectedMode }) {
  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== VARIABLES ===== */
  const mode = game.mode.find(row => row.category === category && row.name === modeName);

  /* ===== FUNCTIONS ===== */
    
  // helper functions
  const { cleanLevelName } = FrontendHelper();

  // function from js file
  const { onLevelClick } = GameLogic();

  /* ===== MODE BODY COMPONENT ===== */
  return (
    // the following is a mode row that shows the name of the mode
    // however, if the user clicks on the mode row, it will toggle between an expanded and unexpected state
    <div className="game-mode-body">

      { /* Game mody body: name - Always will render, and is clickable. If a user clicks on it, toggle between expanded and unexpanded. */ }
      <div className="game-mode-body-name" onClick={ () => selectedMode !== modeName ? setSelectedMode(modeName) : setSelectedMode(null) }>
        <h3>{ cleanLevelName(mode.name) }</h3>
        { modeName === selectedMode ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon /> }
      </div>

      { /* Additional rows will only be rendered if the show state is set to true. */ }
      { modeName === selectedMode &&

        // If the show state is set to true, we want to display a row for each stage.
        mode.level.map(level => {
          return (

            // Game mode body level - Consists of 3 elements: the level name, a button for score chart (optional), and a 
            // button for time chart (optional)
            <div className="game-mode-body-level" key={ level.name }>

              { /* The first element in the row will be the name of the level. */ }
              <div className="game-mode-body-level-name">
                <span>{ cleanLevelName(level.name) }</span>
              </div>

              { /* Render the game mode body level buttons here */ }
              <div className="game-mode-body-level-btns">

                { /* The second element in the row will depend on the chart_type of the level. If it is a score or both
                chart, we want to render a button that will allow the user to navigate to the corresponding level score chart.
                However, if it is a time chart, an empty table element will be rendered. */ }
                { (level.chart_type === "both" || level.chart_type === "score") &&
                  <LevelboardButton abb={ game.abb } category={ category } type={ "score" } levelName={ level.name } onClickFunc={ onLevelClick } />
                }

                { /* The third element in the row will depend on the chart_type of the level. If it is a time or both
                chart, we want to render a button that will allow the user to navigate to the corresponding level time chart.
                However, if it is a score chart, an empty table element will be rendered. */ }
                { (level.chart_type === "both" || level.chart_type === "time") &&
                  <LevelboardButton abb={ game.abb } category={ category } type={ "time" } levelName={ level.name } onClickFunc={ onLevelClick } />
                }
              </div>
             
            </div>
          );
        })
      }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeBody;