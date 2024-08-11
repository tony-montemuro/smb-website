/* ===== IMPORTS ===== */
import styles from "./ModeList.module.css";
import ModeInput from "./ModeInput.jsx";

function ModeList({ modes, category, handleBlur, handleChange, handleInsert, handleDelete, children, errors }) {
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
          const modeId = mode.id;
          const id = `mode_${ category.id }_${ modeId }`;
          const error = errors && errors[modeId] ? errors[modeId] : null;

          return (
            <ModeInput
              id={ id }
              firstModeId={ firstModeId }
              mode={ mode }
              category={ category }
              handleBlur={ handleBlur }
              handleInsert={ handleInsert }
              handleChange={ handleChange }
              handleDelete={ handleDelete }
              error={ error }
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