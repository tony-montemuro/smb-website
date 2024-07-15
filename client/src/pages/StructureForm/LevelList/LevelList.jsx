/* ===== IMPORTS ===== */
import styles from "./LevelList.module.css";
import LevelInput from "./LevelInput.jsx";

function LevelList({ levels, category, mode, handleChange, handleInsert }) {
  /* ===== VARIABLES ===== */
  const filteredLevels = levels.filter(level => level.category === category && level.mode === mode);
  
  /* ===== LEVEL LIST COMPONENT ===== */
  return (
    <div className={ styles.levelList }>
      <h3>Levels</h3>
      { filteredLevels.map(level => {
        return (
          <LevelInput
            level={ level }
            mode={ mode }
            category={ category }
            handleChange={ handleChange }
            key={ `level_${ category }${ mode.id }${ level.id }` }
          />
        );
      })}
      <button type="button" id={ styles.addLevelBtn } onClick={ handleInsert }>Add Level</button>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelList;