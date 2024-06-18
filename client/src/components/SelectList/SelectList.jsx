/* ===== IMPORTS ===== */
import Selector from "./Selector.jsx";
import styles from "./SelectList.module.css";

function SelectList({ entities, inputData, selectData }) {
  /* ===== SELECT LIST COMPONENT ===== */
  return (
    <div className={ styles.selectList }>
      <span>{ inputData.label }</span>
      { entities.toSorted((a, b) => a.id - b.id).map((entity, index) => (
        <Selector 
          inputData={ inputData } 
          selectData={ selectData }
          entity={ entity }
          index={ index }
          key={ entity.id } 
        />
      ))}
      <button 
        type="button" 
        onClick={ () => inputData.handleChange(selectData.entity, entities.length) }
      >
        Add
      </button>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default SelectList;