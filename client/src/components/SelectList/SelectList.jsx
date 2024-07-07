/* ===== IMPORTS ===== */
import styles from "./SelectList.module.css";
import FormHelperText from "@mui/material/FormHelperText";
import Selector from "./Selector.jsx";

function SelectList({ entities, inputData, selectData, children }) {
  /* ===== SELECT LIST COMPONENT ===== */
  return (
    <div className={ styles.selectList }>
      <h3>{ inputData.label }</h3>
      { entities.map(entity => {
        return (
          <Selector
            inputData={ inputData } 
            selectData={ selectData }
            inputValue={ entity[inputData.entityName] }
            handleChange={ inputData.handleChange }
            id={ entity.id }
            key={ JSON.stringify(entity) } 
          >
            { children }
          </Selector>
        );
      })}
      <Selector
        inputData={ inputData }
        selectData={ selectData }
        inputValue=""
        handleChange={ inputData.handleInsert }
        id={ entities.length > 0 ? entities.at(-1).id+1 : 1 }
      />
      { inputData.error && <FormHelperText className={ styles.error } error>{ inputData.error }</FormHelperText> }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default SelectList;