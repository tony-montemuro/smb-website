/* ===== IMPORTS ===== */
import styles from "./ModeList.module.css";
import ModeInput from "./ModeInput.jsx";

function ModeList({ modes, category, id, handleChange }) {
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
            key={ `mode_${ category }${ mode.id }` }
          />
        );
      })}
      <ModeInput 
        mode={ null }
        category={ category }
        id={ id }
        handleChange={ handleChange }
      />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeList;