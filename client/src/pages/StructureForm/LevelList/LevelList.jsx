/* ===== IMPORTS ===== */
import styles from "./LevelList.module.css";
import LevelInput from "./LevelInput.jsx";

function LevelList({ levels, category, mode, handleChange, handleInsert, handleDelete, formData }) {
  /* ===== VARIABLES ===== */
  const categoryName = category.category;
  const modeName = mode.name;
  const filteredLevels = levels.filter(level => level.category === categoryName && level.mode === modeName);
  
  /* ===== LEVEL LIST COMPONENT ===== */
  return (
    <div className={ styles.levelList }>
      <h3>Levels</h3>
      { filteredLevels.map(level => {
        const id = `level-${ category.id }-${ mode.id }-${ level.id }`;
        return (
          <LevelInput
            id={ id }
            level={ level }
            formData={ formData }
            handleChange={ handleChange }
            handleDelete={ handleDelete }
            key={ id }
          />
        );
      })}

      <button 
        type="button"
        disabled={ !modeName }
        className={ styles.levelListBtn }
        onClick={ () => handleInsert(categoryName, modeName) }
      >
        Add Level
      </button>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelList;