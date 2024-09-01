/* ===== IMPORTS ===== */
import styles from "./Sections.module.css";
import Errorable from "./Errorable.jsx";
import FancyLevel from "../../../components/FancyLevel/FancyLevel.jsx";
import FrontendHelper from "../../../helper/FrontendHelper.js";
import LevelHelper from "../../../helper/LevelHelper.js";
import SectionsLogic from "./Sections.js";

/* ===== COMPONENTS ===== */

function GameStructure({ structure, error }) {
  /* ===== GAME STRUCTURE COMPONENT ===== */
  return (
    <div className={ styles.section }>
      <h2>Game Structure</h2>
      <span>
        <em><strong>Note: </strong>IDs are stored on the backend, but are typically invisible to users. You may notice that some IDs are skipped; this is totally normal.</em>
      </span>
      <hr />

      <div>
        { structure.category.map((category, index) => {
          return (
            <div className={ styles.category } key={ category.category }>
              <h3>Category: { category.name }</h3>
              <ModeLevels structure={ structure } category={ category.category } error={ error } />
              { index < structure.category.length-1 ? <hr /> : null }
            </div>
          );
        })}
      </div>

    </div>
  );
};

function ModeLevels({ structure, category, error }) {
  /* ===== VARIABLES ===== */
  const modes = structure.mode.filter(mode => mode.category === category);

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { levelB2F } = LevelHelper();

  /* ===== MODE LEVELS COMPONENT ===== */
  return modes.map(mode => {
    const { id, name } = mode;
    const errorMessage = error?.mode ? error.mode[id] : "";

    return (
      <div key={ `${ id }_${ name }` } className={ styles.mode }>
        <Errorable error={ errorMessage } renderMessage>
          <span className={ styles.modeName }><strong>Mode: { levelB2F(name) }</strong></span>
        </Errorable>
        <Levels structure={ structure } category={ category } mode={ name } error={ error } />
      </div>
    );
  });
};

function Levels({ structure, category, mode, error }) {
  /* ===== VARIABLES ===== */
  const levels = structure.level.filter(level => level.category === category && level.mode.name === mode);

  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { renderBoolean, addGoalToLevelName } = SectionsLogic();

  // helper functions
  const { capitalize, timerTypeB2F } = FrontendHelper();

  /* ===== LEVELS COMPONENT ===== */
  return (
    <table className="table">
      <thead>
        <tr>
          <th className={ styles.column }>ID</th>
          <th>Name</th>
          <th className={ styles.column }>Chart Type</th>
          <th className={ styles.column }>Timer Type</th>
          <th className={ styles.column }>Time</th>
          <th className={ styles.column }>Ascending Score</th>
          <th className={ styles.column }>Ascending Time</th>
        </tr>
      </thead>
      <tbody>
        { levels.map(level => {
          let { ascending, chart_type, goal, id, name, time, timer_type } = level;
          const ascendingScore = ascending === "score" || ascending === "both";
          const ascendingTime = ascending === "time" || ascending === "both";
          const errorMessage = error?.level ? error?.level[id] : "";
          name = addGoalToLevelName(name, goal);

          return (
            <tr key={ `${ id }_${ name }` } className={ errorMessage && styles.levelError } title={ errorMessage }>
              <td className={ styles.column }>{ id }</td>
              <td><FancyLevel level={ name } /></td>
              <td className={ styles.column }>{ capitalize(chart_type) }</td>
              <td className={ styles.column }>{ timerTypeB2F(timer_type) }</td>
              <td className={ styles.column }>{ time }</td>
              <td className={ styles.column }>{ renderBoolean(ascendingScore) }</td>
              <td className={ styles.column }>{ renderBoolean(ascendingTime) }</td>
            </tr>
          );
      })}
      </tbody>
    </table>
  );
};

/* ===== EXPORTS ===== */
export default GameStructure;