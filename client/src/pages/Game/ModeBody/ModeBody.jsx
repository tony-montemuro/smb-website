/* ===== IMPORTS ===== */
import { GameContext } from "../../../utils/Contexts";
import { useContext } from "react";
import styles from "./ModeBody.module.css";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FancyLevel from "../../../components/FancyLevel/FancyLevel.jsx";
import FrontendHelper from "../../../helper/FrontendHelper";
import StylesHelper from "../../../helper/StylesHelper.js";
import TypeButtons from "../../../components/TypeButtons/TypeButtons.jsx";

function ModeBody({ category, modeName, selectedMode, setSelectedMode }) {
  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== VARIABLES ===== */
  const mode = game.mode.find(row => row.category === category && row.name === modeName);

  /* ===== FUNCTIONS ===== */
    
  // helper functions
  const { snakeToTitle } = FrontendHelper();
  const { indexToParity } = StylesHelper();

  /* ===== MODE BODY COMPONENT ===== */
  return (
    <>
      { /* Game mody body: name - Always will render, and is clickable. If a user clicks on it, toggle between expanded and unexpanded. */ }
      <div className={ styles.name } onClick={ () => selectedMode !== modeName ? setSelectedMode(modeName) : setSelectedMode(null) }>
        <h3>{ snakeToTitle(mode.name) }</h3>
        { modeName === selectedMode ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon /> }
      </div>

      { /* Additional rows will only be rendered if the show state is set to true. */ }
      { modeName === selectedMode &&
        mode.level.map((level, index) => {
          return (
            <div className={ `${ styles.levels } ${ indexToParity(index)}` } key={ level.name }>
              <FancyLevel level={ level.name } />
              <TypeButtons abb={ game.abb } category={ category } level={ level } />
            </div>
          );
        })
      }
    </>
  );
};

/* ===== EXPORTS ===== */
export default ModeBody;