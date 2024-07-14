/* ===== IMPORTS ===== */
import styles from "./ModeList.module.css";
import ModeInput from "./ModeInput.jsx";

function ModeList({ modes, category, handleChange, handleInsert, children }) {
  /* ===== VARIABLES ===== */
  const filteredModes = modes.filter(mode => mode.category === category);

  /* ===== MODE LIST COMPONENT ===== */
  return (
    <div className={ styles.modeList }>
      <h3>Modes</h3>
      { filteredModes.map(mode => {
        return (
          <ModeInput
            mode={ mode }
            category={ category }
            handleChange={ handleChange }
            domId={ mode.id }
            key={ `mode_${ category }${ mode.id }` }
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