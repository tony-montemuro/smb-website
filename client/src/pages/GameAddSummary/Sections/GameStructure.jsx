/* ===== IMPORTS ===== */
import { AppDataContext } from "../../../utils/Contexts";
import { useContext } from "react";
import styles from "./Sections.module.css";
import FrontendHelper from "../../../helper/FrontendHelper.js";
import LevelHelper from "../../../helper/LevelHelper.js";
import SectionsLogic from "./Sections.js";

/* ===== COMPONENTS ===== */

function GameStructure({ structure }) {
  console.log(structure);
  /* ===== GAME STRUCTURE COMPONENT ===== */
  return (
    <div className={ styles.section }>
      <h2>Game Structure</h2>
      <hr />

      <div className={ styles.sectionContent }>
        { structure.category.map(category => {
          return (
            <div key={ category.category }>
              <h3>Category: { category.name }</h3>
              <ModeLevels structure={ structure } category={ category.category } />
            </div>
          );
        })}
      </div>

    </div>
  );
};

function ModeLevels({ structure, category }) {
  /* ===== VARIABLES ===== */
  const modes = structure.mode.filter(mode => mode.category === category);

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { levelB2F } = LevelHelper();

  /* ===== MODE LEVELS COMPONENT ===== */
  return modes.map(mode => {
    const { id, name } = mode;
    return (
      <div key={ `${ id }_${ name }` } className={ styles.mode }>
        <span><strong>Mode: { levelB2F(name) }</strong></span>
        <Levels structure={ structure } category={ category } mode={ name } />
      </div>
    );
  });
};

function Levels({ structure, category, mode }) {
  /* ===== CONTEXTS ===== */

  // app data state from app data context
  const { appData } = useContext(AppDataContext);

  /* ===== VARIABLES ===== */
  const levels = structure.level.filter(level => level.category === category && level.mode.name === mode);
  const { practice: isPracticeMode } = appData.categories[category];

  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { renderBoolean } = SectionsLogic();

  // helper functions
  const { capitalize, timerTypeB2F } = FrontendHelper();
  const { levelB2F } = LevelHelper();

  /* ===== LEVELS COMPONENT ===== */
  return levels.map(level => {
    const { ascending, chart_type, id, name, time, timer_type } = level;
    const ascendingScore = ascending === "score" || ascending === "both";
    const ascendingTime = ascending === "time" || ascending === "both";

    return (
      <div key={ `${ id }_${ name }` } className={ styles.level }>
        <span>Name: { levelB2F(name) }</span>
        <span>Chart Type: { capitalize(chart_type) }</span>
        <span>Timer Type: { timerTypeB2F(timer_type) }</span>
        <span>Time: { time }</span>
        { !isPracticeMode ?
          <>
            <span>Ascend Score: { renderBoolean(ascendingScore) }</span>
            <span>Ascend Time: { renderBoolean(ascendingTime) }</span>
          </>
        :
          null
        }
      </div>
    );
  });
};

/* ===== EXPORTS ===== */
export default GameStructure;