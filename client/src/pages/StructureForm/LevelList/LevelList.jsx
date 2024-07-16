/* ===== IMPORTS ===== */
import styles from "./LevelList.module.css";
import LevelInput from "./LevelInput.jsx";

function LevelList({ levels, category, mode, handleChange, handleInsert }) {
  /* ===== VARIABLES ===== */
  const categoryName = category.category;
  const modeName = mode.name;
  const filteredLevels = levels.filter(level => level.category === categoryName && level.mode === modeName);
  
  /* ===== LEVEL LIST COMPONENT ===== */
  return (
    <div className={ styles.levelList }>
      <h3>Levels</h3>
      { filteredLevels.map(level => {
        const id = `level_${ category.id }_${ mode.id }_${ level.id }`;
        return (
          <LevelInput
            id={ id }
            level={ level }
            mode={ mode }
            category={ category }
            handleChange={ handleChange }
            key={ id }
          />
        );
      })}
      <button type="button" id={ styles.addLevelBtn } onClick={ () => handleInsert(categoryName, modeName) }>Add Level</button>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelList;