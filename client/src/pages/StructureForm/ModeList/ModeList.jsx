/* ===== IMPORTS ===== */
import styles from "./ModeList.module.css";
import ModeInput from "./ModeInput.jsx";

function ModeList({ modes, category, handleChange, handleInsert, handleDelete, children }) {
  /* ===== VARIABLES ===== */
  const categoryName = category.category;
  const filteredModes = modes.filter(mode => mode.category === categoryName);
  const firstModeId = filteredModes.length > 0 ? filteredModes[0].id : null;

  /* ===== MODE LIST COMPONENT ===== */
  return (
    <div className={ `${ styles.modeListWrapper } ${ styles.container }` }>
      <div className={ `${ styles.modeList } ${ styles.container }` }>
        <h3>Modes</h3>

        { filteredModes.map(mode => {
          const id = `mode_${ category.id }_${ mode.id }`;
          return (
            <ModeInput
              id={ id }
              firstModeId={ firstModeId }
              mode={ mode }
              category={ category }
              handleChange={ handleChange }
              handleInsert={ handleInsert }
              handleDelete={ handleDelete }
              key={ id }
            >
              { children }
            </ModeInput>
          );
        })}

        <button type="button" id={ styles.addModeBtn } onClick={ () => handleInsert(category) }>Add Mode</button>
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ModeList;