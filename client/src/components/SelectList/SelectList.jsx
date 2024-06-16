/* ===== IMPORTS ===== */
import Selector from "./Selector.jsx";
import styles from "./SelectList.module.css";

function SelectList({ name, entities, inputData, selectData }) {
  /* ===== SELECT LIST COMPONENT ===== */
  return (
    <div className={ styles.selectList }>
      <span>{ name }</span>
      { entities.toSorted((a, b) => a.id - b.id).map(entity => (
        <Selector 
          inputData={ inputData } 
          selectData={ selectData }
          entity={ entity }
          key={ entity.id } 
        />
      ))}
      <button type="button">Add</button>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default SelectList;