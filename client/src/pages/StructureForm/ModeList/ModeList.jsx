/* ===== IMPORTS ===== */
import styles from "./ModeList.module.css";
import ModeInput from "./ModeInput.jsx";

function ModeList({ modes, category, handleChange, handleInsert, children }) {
  /* ===== VARIABLES ===== */
  const categoryName = category.category;
  const filteredModes = modes.filter(mode => mode.category === categoryName);

  /* ===== MODE LIST COMPONENT ===== */
  return (
    <div className={ styles.modeList }>
      <h3>Modes</h3>
      { filteredModes.map(mode => {
        const id = `mode_${ category.id }_${ mode.id }`;
        return (
          <ModeInput
            id={ id }
            mode={ mode }
            category={ category }
            handleChange={ handleChange }
            key={ id }
          >
            { children }
          </ModeInput>
        );
      })}
      <button type="button" id={ styles.addModeBtn } onClick={ () => handleInsert(category) }>Add Mode</button>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeList;