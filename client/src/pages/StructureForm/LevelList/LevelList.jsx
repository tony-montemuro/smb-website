/* ===== IMPORTS ===== */
import styles from "./LevelList.module.css";
import LevelInput from "./LevelInput.jsx";

function LevelList({ levels, category, mode, handleBlur, handleChange, handleInsert, handleDelete, formData, errors }) {
  /* ===== VARIABLES ===== */
  const categoryName = category.category;
  const filteredLevels = levels.filter(level => level.category === categoryName && level.mode.id === mode.id);
  
  /* ===== LEVEL LIST COMPONENT ===== */
  return (
    <div className={ styles.levelList }>
      <h3>Charts</h3>
      { filteredLevels.map(level => {
        const levelId = level.id;
        const id = `level-${ category.id }-${ mode.id }-${ levelId }`;
        const error = errors && errors[levelId] ? errors[levelId] : null;
        
        return (
          <LevelInput
            id={ id }
            level={ level }
            formData={ formData }
            category={ categoryName }
            mode={ mode }
            handleBlur={ handleBlur }
            handleChange={ handleChange }
            handleInsert={ handleInsert }
            handleDelete={ handleDelete }
            error={ error }
            key={ id }
          />
        );
      })}

      <button 
        type="button"
        disabled={ !mode.name }
        className={ styles.levelListBtn }
        onClick={ () => handleInsert(categoryName, mode) }
      >
        Add Chart
      </button>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelList;