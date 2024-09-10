/* ===== IMPORTS ===== */
import styles from "./LevelList.module.css";
import LevelInput from "./LevelInput.jsx";

function LevelList({ levels, category, mode, handleBlur, handleChange, handleInsert, handleDelete, formData, errors }) {
  /* ===== VARIABLES ===== */
  const categoryName = category.category;
  const filteredLevels = levels.filter(level => level.category === categoryName && level.mode.id === mode.id);
  
  /* ===== LEVEL LIST COMPONENT ===== */
  return (
    <div className={ `${ styles.levelList } ${ styles.leftPadding }` }>
      <h3>Charts</h3>
      <div className={ styles.levelList }>
        { filteredLevels.map(level => {
          const levelId = level.id;
          const id = `level-${ category.id }-${ mode.id }-${ levelId }`;
          const error = errors && errors[levelId] ? errors[levelId] : null;
          
          return (
            <LevelInput
              level={ level }
              formData={ formData }
              category={ category }
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
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelList;