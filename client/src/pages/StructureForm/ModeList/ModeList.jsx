/* ===== IMPORTS ===== */
import styles from "./ModeList.module.css";
import ModeInput from "./ModeInput.jsx";

function ModeList({ modes, category, id }) {
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
            id={ id }
            key={ `mode_${ category }${ id }` }
          />
        );
      })}
      <ModeInput 
        mode={ "" }
        category={ category }
        id={ id }
      />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeList;