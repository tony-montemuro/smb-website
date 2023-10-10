/* ===== IMPORTS ===== */
import styles from "./ButtonList.module.css";

function ButtonList({ buttons, current, setCurrent, hasPadding = true, wrap = false }) {
  /* ===== VARIABLES ===== */ 
  const style = { padding: hasPadding ? "5px" : "0", flexWrap: wrap ? "wrap" : "nowrap" };

  /* ===== BUTTON LIST COMPONENT ===== */
  return (
    <div className={ `${ styles.buttonList } center` } style={ style }>
      { buttons.map(button => {
        return (
          <button 
            type="button"
            onClick={ () => setCurrent(button.value) }
            className={ `${ current === button.value ? ` ${ styles.selected }` : "" }` }
            key={ button.name }
          >
            { button.name }
          </button>
        );
      })}
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ButtonList;