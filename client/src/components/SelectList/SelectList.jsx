/* ===== IMPORTS ===== */
import Selector from "./Selector.jsx";
import styles from "./SelectList.module.css";

function SelectList({ entities, inputData, selectData }) {
  /* ===== SELECT LIST COMPONENT ===== */
  return (
    <div className={ styles.selectList }>
      <span>{ inputData.label }</span>
      { entities.map(entity => (
        <Selector 
          inputData={ inputData } 
          selectData={ selectData }
          value={ entity[selectData.entityName] }
          handleChange={ inputData.handleChange }
          id={ entity.id }
          key={ entity.id } 
        />
      ))}
      <Selector 
        inputData={ inputData }
        selectData={ selectData }
        value=""
        handleChange={ inputData.handleInsert }
        id={ entities.length > 0 ? entities.at(-1).id+1 : 1 }
      />
    </div>
  );
};

/* ===== EXPORTS ===== */
export default SelectList;